const crypto = require('crypto');
const sharp = require('sharp');

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  // eslint-disable-next-line global-require
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const preprocessImageForVision = async (filePath) => {
  // Stable PNG improves vision reliability (rotate handles phone photos).
  return sharp(filePath, { failOnError: false })
    .rotate()
    .resize({ width: 2000, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();
};

const stripCodeFences = (text) => {
  if (!text) return '';
  const trimmed = String(text).trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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

  const patientName = (summary.patientName || '').toString().trim() || 'Not found';
  const doctorName = (summary.doctorName || '').toString().trim() || 'Not found';
  const hospitalName = (summary.hospitalName || '').toString().trim() || 'Not found';
  const reason = (summary.reason || '').toString().trim() || 'Not found';

  const medicines = Array.isArray(summary.medicines) ? summary.medicines : [];
  const cleaned = medicines
    .map((m) => ({
      medicineName: (m?.medicineName || '').toString().trim() || 'Not found',
      dosage: (m?.dosage || '').toString().trim() || 'Not found',
      days: normalizeDays(m?.days)
    }))
    .filter(
      (m) =>
        m.medicineName !== 'Not found' ||
        m.dosage !== 'Not found' ||
        m.days !== 'Not found'
    )
    .slice(0, 12);

  return { patientName, doctorName, hospitalName, reason, medicines: cleaned };
};

async function analyzeWithGeminiVision({ filePath }) {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  const requestId = crypto.randomBytes(6).toString('hex');
  const pngBuffer = await preprocessImageForVision(filePath);

  // Not-premium / best value. Use a model that exists for your key and supports vision.
  // Your key supports: models/gemini-2.5-flash (recommended) and models/gemini-2.5-flash-image.
  const modelName = process.env.GEMINI_VISION_MODEL || 'models/gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = [
    `RequestId: ${requestId}`,
    'You are a medical prescription extractor.',
    'The prescription may be handwritten.',
    'Return ONLY valid JSON. No markdown, no extra text.',
    'JSON schema:',
    '{',
    '  "patientName": string,',
    '  "doctorName": string,',
    '  "hospitalName": string,',
    '  "reason": string,',
    '  "medicines": [',
    '    { "medicineName": string, "dosage": string, "days": string|number }',
    '  ]',
    '}',
    'Rules:',
    '- Use "Not found" if unknown.',
    '- medicines must be row-wise and correctly mapped.',
    '- dosage examples: "1-0-1", "OD", "BD", "TID", "500mg BD".',
    '- days must be just the count of days (number) if possible.',
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
    meta: { requestId, used: 'gemini_vision', parseError: !parsed, model: modelName }
  };
}

module.exports = {
  analyzeWithGeminiVision
};

