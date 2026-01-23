const axios = require('axios');

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  // eslint-disable-next-line global-require
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const violatesPrivacyOrSensitive = (q) => {
  const text = String(q || '').toLowerCase();
  if (!text.trim()) return true;

  // Refuse deep privacy violations / doxxing / illegal access.
  const blocked = [
    'dox', 'doxx', 'hack', 'bypass', 'steal', 'leak', 'private data', 'address',
    'phone number', 'email address', 'aadhar', 'ssn', 'social security',
    'credit card', 'bank', 'password', 'otp', 'medical records of', 'identify this person'
  ];
  return blocked.some((s) => text.includes(s));
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const stripCodeFences = (text) => {
  if (!text) return '';
  const trimmed = String(text).trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
};

const stripUrlsFromText = (text) => {
  const t = String(text || '');
  // Remove obvious URLs so the bot never shows referral links in the answer.
  return t
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const normalizeMessages = (messages) => {
  const arr = Array.isArray(messages) ? messages : [];
  return arr
    .map((m) => ({
      role: m?.role === 'user' ? 'user' : 'bot',
      content: String(m?.content || '').trim()
    }))
    .filter((m) => m.content)
    .slice(-12);
};

const heuristicMedical = (q) => {
  const text = String(q || '').toLowerCase();
  if (!text.trim()) return false;

  // If a user describes personal symptoms/conditions, treat as medical.
  const personalHealthPatterns = [
    'i have', 'i feel', 'my', 'pain', 'fever', 'cough', 'cold', 'headache',
    'stomach', 'vomit', 'nausea', 'dizzy', 'dizziness', 'rash', 'itch', 'sleep',
    'bp', 'blood pressure', 'sugar', 'diabetes', 'thyroid', 'cholesterol'
  ];
  if (personalHealthPatterns.some((s) => text.includes(s))) return true;

  const medicalSignals = [
    'symptom', 'symptoms', 'disease', 'infection', 'virus', 'bacteria',
    'medicine', 'drug', 'tablet', 'dosage', 'dose', 'side effect', 'contraindication',
    'blood', 'pressure', 'heart', 'pulse',
    'kidney', 'liver', 'gut', 'skin', 'brain', 'nerve',
    'vitamin', 'nutrition', 'diet', 'calorie', 'protein',
    'biology', 'cell', 'dna', 'gene', 'genetics', 'immunity', 'immune'
  ];
  return medicalSignals.some((s) => text.includes(s));
};

const estimateSensitivity = (q) => {
  const text = String(q || '').toLowerCase();
  if (!text.trim()) return 100;

  // Self-harm / suicide: treat as highest sensitivity and respond with urgent guidance.
  const selfHarm = ['suicide', 'kill myself', 'end my life', 'self harm', 'self-harm'];
  if (selfHarm.some((s) => text.includes(s))) return 100;

  // Privacy/illegal handled elsewhere; default moderate.
  return 50;
};

const buildSearchQueries = (question) => {
  const q = String(question || '').trim();
  if (!q) return [];

  const stop = new Set([
    'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'a', 'an', 'the', 'and', 'or',
    'to', 'of', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were', 'be', 'been',
    'do', 'does', 'did', 'what', 'why', 'how', 'when', 'where', 'pls', 'please'
  ]);

  const tokens = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && t.length >= 3 && !stop.has(t));

  const unique = [];
  for (const t of tokens) {
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= 8) break;
  }

  const keywordQuery = unique.length ? unique.join(' ') : q;
  return [q, keywordQuery].filter(Boolean).slice(0, 2);
};

const classifyWithGemini = async ({ question, messages }) => {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  const modelName = process.env.GEMINI_TEXT_MODEL || 'models/gemini-2.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 500
    }
  });

  // User preference: allow ~95% of normal personal medical questions.
  // Only refuse if: non-medical OR high sensitivity (>=95) privacy/illegal/extreme.
  const prompt = [
    'You are a classifier for a medical chatbot.',
    'Return ONLY valid JSON (no markdown).',
    '',
    'Task:',
    '- Determine if the user question is medical/health/biology related.',
    '- Estimate sensitivity on a 0-100 scale:',
    '  - 0-30: general health/biology, lifestyle, nutrition',
    '  - 31-70: personal symptoms/conditions (still allowed)',
    '  - 71-94: more sensitive personal health (still allowed, respond cautiously)',
    '  - 95-100: very high sensitivity or disallowed (privacy violations, illegal access, doxxing, requests to identify people, etc.)',
    '',
    'The user may write poor English, slang, typos, or broken grammar. You must still infer intent.',
    'Also create:',
    '- a normalized (clean) medical question in simple English (no personal identifiers).',
    '- 3-6 safe search queries for retrieval (keywords + synonyms; remove names/identifiers).',
    '',
    'JSON schema:',
    '{',
    '  "medicalRelated": boolean,',
    '  "sensitivity": number,',
    '  "category": "medical"|"non_medical"|"privacy_violation"|"illegal"|"other",',
    '  "safeToAnswer": boolean,',
    '  "normalizedQuestion": string,',
    '  "searchQueries": string[]',
    '}',
    '',
    'Conversation context (may contain broken English):',
    JSON.stringify(normalizeMessages(messages)),
    '',
    'User question:',
    question
  ].join('\n');

  const result = await model.generateContent([{ text: prompt }]);
  const text = result?.response?.text?.() || '';
  const parsed = safeJsonParse(stripCodeFences(text));
  if (!parsed || typeof parsed !== 'object') return null;

  const sensitivity = Math.max(0, Math.min(100, Number(parsed.sensitivity)));
  const medicalRelated = !!parsed.medicalRelated;
  const category = String(parsed.category || 'other');
  const safeToAnswer = !!parsed.safeToAnswer && medicalRelated && sensitivity < 95 && category !== 'privacy_violation' && category !== 'illegal';
  const normalizedQuestion = String(parsed.normalizedQuestion || '').trim();
  const searchQueries = Array.isArray(parsed.searchQueries) ? parsed.searchQueries : [];
  const cleanedQueries = searchQueries
    .map((q) => String(q || '').trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    medicalRelated,
    sensitivity,
    category,
    safeToAnswer,
    normalizedQuestion,
    searchQueries: cleanedQueries,
    model: modelName
  };
};

const europePmcSearch = async (query) => {
  // Europe PMC provides abstracts/snippets in JSON (no API key required)
  const url = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
  const res = await axios.get(url, {
    params: {
      query,
      format: 'json',
      pageSize: 5,
      sort: 'relevance'
    },
    timeout: 15000
  });

  const results = res?.data?.resultList?.result || [];
  return results
    .map((r) => {
      const pmid = r.pmid || '';
      const title = r.title || '';
      const journal = r.journalTitle || r.journalInfo?.journal?.title || 'Europe PMC';
      const year = r.pubYear || r.firstPublicationDate || '';
      const abstractText = r.abstractText || '';
      const urlOut = pmid ? `https://europepmc.org/article/MED/${pmid}` : (r.doi ? `https://doi.org/${r.doi}` : '');
      return {
        title,
        source: journal,
        year,
        url: urlOut || 'https://europepmc.org/',
        snippet: abstractText ? String(abstractText).replace(/\s+/g, ' ').trim() : ''
      };
    })
    .filter((x) => x.title || x.snippet);
};

const pubmedSearch = async (query) => {
  // PubMed E-utilities (no API key required for light usage)
  // 1) esearch -> top IDs
  const esearchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  const esearch = await axios.get(esearchUrl, {
    params: {
      db: 'pubmed',
      term: query,
      retmode: 'json',
      retmax: 5,
      sort: 'relevance'
    },
    timeout: 15000
  });
  const ids = esearch?.data?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  // 2) esummary -> titles/journals/dates
  const esummaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
  const esummary = await axios.get(esummaryUrl, {
    params: { db: 'pubmed', id: ids.join(','), retmode: 'json' },
    timeout: 15000
  });

  const result = [];
  const map = esummary?.data?.result || {};
  for (const id of ids) {
    const item = map[id];
    if (!item) continue;
    const title = item.title || '';
    const source = item.fulljournalname || item.source || 'PubMed';
    const pubDate = item.pubdate || '';
    result.push({
      title,
      source,
      year: pubDate,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      snippet: ''
    });
  }
  return result;
};

const wikiSummary = async (query) => {
  // Fallback: Wikipedia REST summary (quick, general info)
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await axios.get(url, { timeout: 12000 });
    if (!res?.data?.extract) return [];
    return [
      {
        title: res.data.title || query,
        source: 'Wikipedia',
        year: '',
        url: res.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: res.data.extract
      }
    ];
  } catch {
    return [];
  }
};

const buildAnswer = async ({ question, normalizedQuestion, sources, messages }) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return {
      answer: 'Chatbot is not configured (missing GEMINI_API_KEY).',
      citations: sources || []
    };
  }

  const modelName = process.env.GEMINI_TEXT_MODEL || 'models/gemini-2.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      // ChatGPT-like: clear, stable, not overly random.
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 1400
    }
  });

  const sourcesText = (sources || [])
    .slice(0, 6)
    .map((s, idx) => {
      const bits = [
        `[#${idx + 1}] ${s.title || 'Untitled'}`,
        s.source ? `Source: ${s.source}` : null,
        s.year ? `Date: ${s.year}` : null,
        s.url ? `URL: ${s.url}` : null,
        s.snippet ? `Notes: ${String(s.snippet).slice(0, 400)}` : null
      ].filter(Boolean);
      return bits.join('\n');
    })
    .join('\n\n');

  const prompt = [
    'You are "Med Twin", a friendly personal wellbeing assistant for a patient (ChatGPT-like).',
    'Your tone: warm, calm, supportive, and easy to understand. Use simple English.',
    'Scope & safety rules (must follow):',
    '- Answer ONLY medical, health, or biology questions. If not, refuse briefly.',
    '- Personal health questions are allowed. Be cautious and avoid definitive diagnosis.',
    '- Do NOT provide instructions for illegal access, doxxing, or privacy violations.',
    '- The user may write broken/poor English. Interpret intent and respond in SIMPLE English.',
    '- Keep answers practical and relevant; ask up to 2 clarifying questions if needed.',
    '- Include a short safety note: when to see a clinician / red-flag symptoms if relevant.',
    '',
    'Use the provided sources for retrieval. Do not hallucinate.',
    'If sources are insufficient, say so and give general guidance only (clearly label uncertainty).',
    '',
    'Conversation context (last messages):',
    JSON.stringify(normalizeMessages(messages)),
    '',
    'User question:',
    question,
    '',
    'Normalized question (your best interpretation of what the user meant):',
    normalizedQuestion || '(not provided)',
    '',
    'Retrieved sources:',
    sourcesText || '(none)',
    '',
    'Output rules (must follow):',
    '- Do NOT include any URLs/links or a "Sources" section in the final answer.',
    '- Do NOT mention you used web search or citations.',
    '- Be smooth and natural like ChatGPT.',
    '- Make formatting clean and easy to read (short paragraphs, bullets, and clear spacing).',
    '- Do NOT use markdown (no **bold**, no code fences). Plain text only.',
    '- IMPORTANT: You must include ALL sections listed below. Do not stop early.',
    '',
    'Answer format (plain text):',
    'Opening: 1 friendly line.',
    '',
    'What I understood:',
    '- 1 sentence in simple English.',
    '',
    'Possible reasons (not a diagnosis):',
    '- 3–6 bullets (most common first).',
    '',
    'What you can do now:',
    '- 4–8 bullets (safe, practical, low-cost).',
    '',
    'Red flags (get urgent care):',
    '- bullets (only if relevant).',
    '',
    'Quick questions for you (optional):',
    '- Ask up to 2 short questions ONLY if it changes the advice.'
  ].join('\n');

  const result = await model.generateContent([{ text: prompt }]);
  const text = result?.response?.text?.() || '';

  return {
    answer: stripUrlsFromText(text) || 'Sorry, I could not generate a response.',
    citations: (sources || []).slice(0, 6),
    meta: { model: modelName, used: 'gemini_text' }
  };
};

async function answerMedicalQuestion({ question, messages }) {
  if (violatesPrivacyOrSensitive(question)) {
    return {
      refused: true,
      reason: 'privacy_or_sensitive',
      answer:
        'I can’t help with requests that involve private/sensitive data or privacy violations. Ask a general medical/biology question without personal identifiers.'
    };
  }

  // IMPORTANT (reliability + cost): avoid a separate Gemini classification call.
  // We do ONE Gemini call for the actual answer; everything else uses heuristics.
  const medicalRelated = heuristicMedical(question);
  const sensitivity = estimateSensitivity(question);

  if (!medicalRelated) {
    return {
      refused: true,
      reason: 'non_medical',
      answer:
        'I can only answer medical and biology-related questions. Please ask something in that scope.'
    };
  }

  if (sensitivity >= 95) {
    return {
      refused: true,
      reason: 'too_sensitive',
      answer:
        'I can’t help with that specific request because it’s very sensitive. If you share a general medical question (without identifiers), I can help.'
    };
  }

  // Live retrieval
  const normalizedQuestion = '';
  const candidateQueries = buildSearchQueries(question);

  let sources = [];
  // Prefer Europe PMC first (abstracts improve answer quality). Do first 2 in parallel for speed.
  try {
    const attempts = candidateQueries.slice(0, 2).map((q) => europePmcSearch(q));
    const settled = await Promise.allSettled(attempts);
    for (const s of settled) {
      if (s.status === 'fulfilled' && Array.isArray(s.value) && s.value.length) {
        sources = s.value;
        break;
      }
    }
  } catch {
    sources = [];
  }

  // Fallback: PubMed titles if Europe PMC returns nothing.
  if (!sources.length) {
    try {
      const attempts = candidateQueries.slice(0, 2).map((q) => pubmedSearch(q));
      const settled = await Promise.allSettled(attempts);
      for (const s of settled) {
        if (s.status === 'fulfilled' && Array.isArray(s.value) && s.value.length) {
          sources = s.value;
          break;
        }
      }
    } catch {
      sources = [];
    }
  }
  if (!sources.length) {
    for (const q of candidateQueries) {
      // eslint-disable-next-line no-await-in-loop
      sources = await wikiSummary(q);
      if (sources.length) break;
    }
  }

  try {
    const built = await buildAnswer({ question, normalizedQuestion, sources, messages });
    return {
      refused: false,
      sensitivity,
      normalizedQuestion: undefined,
      ...built
    };
  } catch (e) {
    const msg = String(e?.message || '');
    const isRateLimit = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate');
    if (isRateLimit) {
      return {
        refused: false,
        sensitivity,
        answer:
          'I’m temporarily busy (rate limit). Please try again in about 30 seconds. If this keeps happening, your Gemini free-tier quota may be exhausted for today.',
        meta: { used: 'fallback_rate_limit' }
      };
    }
    return {
      refused: false,
      sensitivity,
      answer: 'I had trouble generating a response right now. Please try again in a moment.',
      meta: { used: 'fallback_error' }
    };
  }
}

module.exports = {
  answerMedicalQuestion
};

