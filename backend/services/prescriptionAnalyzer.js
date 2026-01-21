const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

let visionClient = null;
const getGoogleVisionClient = () => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) return null;
  if (visionClient) return visionClient;
  // Lazy require to avoid crashing if package isn't installed in some environments
  // eslint-disable-next-line global-require
  const vision = require('@google-cloud/vision');
  visionClient = new vision.ImageAnnotatorClient();
  return visionClient;
};

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  // eslint-disable-next-line global-require
  const OpenAI = require('openai');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  // eslint-disable-next-line global-require
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const preprocessImageForVision = async (filePath) => {
  // Produce a stable PNG for vision/OCR
  return sharp(filePath, { failOnError: false })
    .rotate()
    .resize({ width: 1800, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .png()
    .toBuffer();
};

const googleVisionOcr = async (imageBuffer) => {
  const client = getGoogleVisionClient();
  if (!client) return null;
  const [result] = await client.textDetection({ image: { content: imageBuffer } });
  const fullText = result?.fullTextAnnotation?.text || result?.textAnnotations?.[0]?.description || '';
  return fullText.trim() ? fullText : null;
};

const toDataUrl = (mimeType, buffer) => {
  const b64 = buffer.toString('base64');
  return `data:${mimeType};base64,${b64}`;
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
  const trimmed = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
};

const normalizeDays = (value) => {
  if (value == null) return 'Not found';
  const str = String(value).trim();
  if (!str) return 'Not found';
  const m = str.match(/\d+/);
  return m ? m[0] : 'Not found';
};

const ensureSummaryShape = (obj) => {
  const summary = obj && typeof obj === 'object' ? obj : {};
  const doctorName = (summary.doctorName || '').toString().trim() || 'Not found';
  const hospitalName = (summary.hospitalName || '').toString().trim() || 'Not found';
  const medicines = Array.isArray(summary.medicines) ? summary.medicines : [];

  const cleaned = medicines
    .map((m) => ({
      medicineName: (m?.medicineName || '').toString().trim() || 'Not found',
      dosage: (m?.dosage || '').toString().trim() || 'Not found',
      days: normalizeDays(m?.days)
    }))
    .filter((m) => m.medicineName !== 'Not found' || m.dosage !== 'Not found' || m.days !== 'Not found')
    .slice(0, 12);

  return { doctorName, hospitalName, medicines: cleaned };
};

async function analyzeWithGeminiVision({ filePath }) {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  const pngBuffer = await preprocessImageForVision(filePath);
  const requestId = crypto.randomBytes(6).toString('hex');

  // Gemini can do both OCR + handwriting understanding from the image directly.
  const modelName = process.env.GEMINI_VISION_MODEL || 'gemini-1.5-pro';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = [
    `RequestId: ${requestId}`,
    'You are a medical prescription extractor.',
    'The prescription may be handwritten.',
    'Extract and return ONLY valid JSON (no markdown, no extra words).',
    'JSON schema:',
    '{',
    '  "doctorName": string,',
    '  "hospitalName": string,',
    '  "medicines": [',
    '    { "medicineName": string, "dosage": string, "days": string|number }',
    '  ]',
    '}',
    'Rules:',
    '- If unknown, use "Not found".',
    '- Dosage examples: "1-0-1", "OD", "BD", "TID", "500mg BD".',
    '- days should be the number of days if possible (example: 5).',
  ].join('\n');

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: 'image/png',
        data: pngBuffer.toString('base64')
      }
    }
  ]);

  const text = result?.response?.text?.() || '';
  const parsed = safeJsonParse(stripCodeFences(text));

  return {
    summary: ensureSummaryShape(parsed),
    meta: { requestId, used: 'gemini_vision', parseError: !parsed }
  };
}

/**
 * LLM+Vision prescription extraction.
 * - Step 1: OCR with Google Vision (if configured)
 * - Step 2: Send image + OCR text to OpenAI Vision to interpret handwriting
 * - Step 3: Return structured JSON for UI table
 */
async function analyzePrescriptionLLMVision({ filePath, mimeType }) {
  // Prefer Gemini Vision if configured (single API key approach)
  const gemini = await analyzeWithGeminiVision({ filePath });
  if (gemini && gemini.summary) return gemini;

  const openai = getOpenAIClient();
  if (!openai) return null;

  const pngBuffer = await preprocessImageForVision(filePath);
  const ocrText = await googleVisionOcr(pngBuffer);

  // Use PNG data URL for strong vision ingestion
  const imageUrl = toDataUrl('image/png', pngBuffer);
  const requestId = crypto.randomBytes(6).toString('hex');

  const system = [
    'You extract structured information from medical prescriptions.',
    'The prescription may be handwritten and messy.',
    'Return ONLY valid JSON, no markdown, no extra text.',
    'If a field is unknown, set it to "Not found".',
    'Output JSON schema:',
    '{',
    '  "doctorName": string,',
    '  "hospitalName": string,',
    '  "medicines": [',
    '    { "medicineName": string, "dosage": string, "days": string|number }',
    '  ]',
    '}',
    'Dosage examples: "1-0-1", "OD", "BD", "TID", "500mg BD".',
    'Days should be just the number of days if possible (e.g., "5").'
  ].join('\n');

  const user = [
    `RequestId: ${requestId}`,
    'Task: Read the prescription image and extract doctorName, hospitalName, and a medicine table.',
    'Return medicines as separate rows. If there are multiple medicines, include each.',
    'If OCR text is provided, use it as a hint but trust the image if OCR is wrong.',
    ocrText ? `OCR_HINT:\n${ocrText}` : 'OCR_HINT: Not available'
  ].join('\n\n');

  const resp = await openai.chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          { type: 'text', text: user },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ]
  });

  const content = resp?.choices?.[0]?.message?.content || '';
  const parsed = safeJsonParse(stripCodeFences(content));
  if (!parsed) {
    return {
      summary: ensureSummaryShape(null),
      meta: { requestId, used: 'openai_vision', parseError: true }
    };
  }

  return {
    summary: ensureSummaryShape(parsed),
    meta: { requestId, used: 'openai_vision', parseError: false }
  };
}

module.exports = {
  analyzePrescriptionLLMVision
};

