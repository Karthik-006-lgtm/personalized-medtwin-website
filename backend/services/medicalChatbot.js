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

const classifyWithGemini = async ({ question, messages }) => {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  const modelName = process.env.GEMINI_TEXT_MODEL || 'models/gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

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
  const model = genAI.getGenerativeModel({ model: modelName });

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
    'You are "Med Twin", a ChatGPT-like medical & biology assistant.',
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
    'Write the answer like ChatGPT (clear and helpful):',
    '- Start with: "Here’s what I understood:" + 1 sentence.',
    '- Then sections (keep concise):',
    '  1) What it could mean (common causes, not a diagnosis)',
    '  2) What you can do now (safe self-care steps)',
    '  3) When to see a doctor urgently (red flags)',
    '  4) 1–2 questions for you (only if needed)',
    '- End with sources URLs (max 4).',
  ].join('\n');

  const result = await model.generateContent([{ text: prompt }]);
  const text = result?.response?.text?.() || '';

  return {
    answer: text.trim() || 'Sorry, I could not generate a response.',
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

  // Classify with Gemini (preferred). Fallback to heuristics.
  const classification = await classifyWithGemini({ question, messages });
  const medicalRelated = classification ? classification.medicalRelated : heuristicMedical(question);
  const sensitivity = classification ? classification.sensitivity : 50;
  const category = classification ? classification.category : (medicalRelated ? 'medical' : 'non_medical');
  const safeToAnswer = classification ? classification.safeToAnswer : medicalRelated;

  if (!medicalRelated) {
    return {
      refused: true,
      reason: 'non_medical',
      answer:
        'I can only answer medical and biology-related questions. Please ask something in that scope.'
    };
  }

  if (!safeToAnswer || sensitivity >= 95 || category === 'privacy_violation' || category === 'illegal') {
    return {
      refused: true,
      reason: 'too_sensitive',
      answer:
        'I can’t help with that specific request because it’s too sensitive or could violate privacy/safety. If you share a general medical question without identifiers, I can help.'
    };
  }

  // Live retrieval
  const normalizedQuestion = (classification?.normalizedQuestion || '').trim() || '';
  const candidateQueries = [
    ...(classification?.searchQueries || []),
    normalizedQuestion,
    question
  ]
    .map((q) => String(q || '').trim())
    .filter(Boolean)
    .slice(0, 8);

  let sources = [];
  // Prefer Europe PMC first (abstracts improve answer quality).
  for (const q of candidateQueries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      sources = await europePmcSearch(q);
    } catch (e) {
      sources = [];
    }
    if (sources.length) break;
  }

  // Fallback: PubMed titles if Europe PMC returns nothing.
  for (const q of candidateQueries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      sources = await pubmedSearch(q);
    } catch (e) {
      sources = [];
    }
    if (sources.length) break;
  }
  if (!sources.length) {
    for (const q of candidateQueries) {
      // eslint-disable-next-line no-await-in-loop
      sources = await wikiSummary(q);
      if (sources.length) break;
    }
  }

  const built = await buildAnswer({ question, normalizedQuestion, sources, messages });
  return {
    refused: false,
    sensitivity,
    normalizedQuestion: normalizedQuestion || undefined,
    ...built
  };
}

module.exports = {
  answerMedicalQuestion
};

