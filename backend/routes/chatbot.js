const express = require('express');
const auth = require('../middleware/auth');
const { answerMedicalQuestion } = require('../services/medicalChatbot');

const router = express.Router();

// Debug helper (does NOT reveal the key). Useful to verify the running server loaded backend/.env.
router.get('/debug-env', auth, (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  const key = String(process.env.GEMINI_API_KEY || '');
  return res.json({
    geminiKeyPresent: !!key,
    geminiKeyLength: key.length,
    geminiKeyStartsWithAIza: key.startsWith('AIza'),
    geminiTextModel: process.env.GEMINI_TEXT_MODEL || null,
    geminiTextModelFallbacks: process.env.GEMINI_TEXT_MODEL_FALLBACKS || ''
  });
});

// Medical chatbot: retrieval + Gemini summarization
router.post('/ask', auth, async (req, res) => {
  try {
    const question = (req.body?.question || '').toString().trim();
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const result = await answerMedicalQuestion({ question, messages });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Chatbot error' });
  }
});

module.exports = router;

