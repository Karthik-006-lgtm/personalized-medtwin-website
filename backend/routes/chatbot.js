const express = require('express');
const auth = require('../middleware/auth');
const { answerMedicalQuestion } = require('../services/medicalChatbot');

const router = express.Router();

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

