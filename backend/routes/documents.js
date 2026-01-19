const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalDocument = require('../models/MedicalDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|pdf|application\/msword|application\/vnd/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
});

// Upload medical document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType, notes } = req.body;

    const document = new MedicalDocument({
      userId: req.userId,
      documentType,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      notes: notes || ''
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents for user
router.get('/', auth, async (req, res) => {
  try {
    const { documentType } = req.query;
    
    const query = { userId: req.userId };
    if (documentType) {
      query.documentType = documentType;
    }

    const documents = await MedicalDocument.find(query).sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await MedicalDocument.findOne({
      _id: documentId,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await MedicalDocument.deleteOne({ _id: documentId });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
