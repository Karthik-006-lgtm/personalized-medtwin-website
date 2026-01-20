const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalDocument = require('../models/MedicalDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const { analyzePrescriptionLLMVision } = require('../services/prescriptionAnalyzer');

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

let ocrWorkerPromise = null;

const getOcrWorker = async () => {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const worker = await Tesseract.createWorker('eng');
      // Improve typical prescription OCR (mixed blocks, short lines)
      await worker.setParameters({
        tessedit_pageseg_mode: '6' // Assume a single uniform block of text
      });
      return worker;
    })();
  }
  return ocrWorkerPromise;
};

const preprocessImageForOcr = async (filePath) => {
  // Upscale + grayscale + normalize + sharpen for better OCR on photos
  const img = sharp(filePath, { failOnError: false }).rotate();
  const metadata = await img.metadata();
  const width = metadata.width || 0;
  const targetWidth = width > 0 ? Math.min(2200, Math.max(1400, width * 2)) : 1800;
  return await img
    .resize({ width: targetWidth, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(180)
    .png()
    .toBuffer();
};

const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    try {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      if (pdfData.text && pdfData.text.trim().length > 0) {
        return pdfData.text;
      }
    } catch (error) {
      console.warn('PDF text extraction failed:', error.message);
    }
  }

  // OCR fallback (images, scanned PDFs)
  const worker = await getOcrWorker();
  const imageBuffer = await preprocessImageForOcr(filePath);

  // Try two page segmentation modes and pick the better-confidence output
  const tryOcr = async (psm) => {
    await worker.setParameters({ tessedit_pageseg_mode: String(psm) });
    const result = await worker.recognize(imageBuffer);
    return {
      text: result.data.text || '',
      confidence: typeof result.data.confidence === 'number' ? result.data.confidence : 0
    };
  };

  const r1 = await tryOcr(6);
  const r2 = await tryOcr(11);
  const best = r2.confidence > r1.confidence ? r2 : r1;
  return best.text;
};

const parsePrescriptionSummary = (rawText) => {
  const text = (rawText || '').replace(/\s+/g, ' ').trim();
  const lines = (rawText || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 80);

  // Common prescription patterns
  const dosagePattern = /\b(\d+\s*-\s*\d+\s*-\s*\d+|OD|BD|TID|QID|HS|SOS|STAT)\b/i;
  const medicineHint = /\b(tab|tablet|cap|capsule|syrup|inj|injection|mg|ml)\b/i;
  const durationPattern = /\b(\d+)\s*(day|days|week|weeks|month|months)\b/i;

  const headerLines = lines.slice(0, 12);
  const hospitalLine =
    headerLines.find(l => /\b(hospital|clinic|medical|centre|center)\b/i.test(l)) ||
    headerLines.find(l => /\b(pharmacy|dispensary)\b/i.test(l)) ||
    'Not found';

  const doctorLine =
    headerLines.find(l => /\bdr\.?\b/i.test(l)) ||
    headerLines.find(l => /\bmbbs|md|ms|bds\b/i.test(l)) ||
    'Not found';

  // Candidate medicine lines: look for dosage patterns OR medicine hints
  const medicineCandidates = lines.filter(l => dosagePattern.test(l) || medicineHint.test(l));

  // Extract medicine-like phrase from a line (simple heuristic)
  const extractMedicineFromLine = (line) => {
    // Remove obvious noise
    const cleaned = line
      .replace(/(rx|prescription|diagnosis|dx|sig|take|daily|morning|night)/gi, '')
      .replace(dosagePattern, '')
      .replace(durationPattern, '')
      .replace(/[^\w\s.+-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Prefer first 2-4 tokens that look like a drug name
    const tokens = cleaned.split(' ').filter(Boolean);
    const picked = tokens.slice(0, 4).join(' ');
    return picked || null;
  };

  const parseMedicineRow = (line) => {
    const durationMatch = line.match(durationPattern) || text.match(durationPattern);
    const dosageMatch = line.match(dosagePattern) || line.match(/\b(\d+)\s*(mg|ml)\b/i);

    const days = durationMatch ? durationMatch[1] : 'Not found';
    const dosage = dosageMatch ? dosageMatch[0] : 'Not found';
    const name = extractMedicineFromLine(line) || 'Not found';
    return { medicineName: name, dosage, days };
  };

  const medicines = medicineCandidates
    .map(parseMedicineRow)
    .filter(m => m.medicineName && m.medicineName !== 'Not found')
    .slice(0, 10);

  return {
    doctorName: doctorLine,
    hospitalName: hospitalLine,
    medicines,
    // Intentionally not returning raw extracted text to UI
  };
};

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

// Analyze prescription with OCR
router.post('/analyze-prescription', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { notes } = req.body;

    const document = new MedicalDocument({
      userId: req.userId,
      documentType: 'Prescription',
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      notes: notes || ''
    });

    await document.save();

    // Preferred: LLM + Vision pipeline (best for handwriting) if configured
    const llmResult = await analyzePrescriptionLLMVision({
      filePath: req.file.path,
      mimeType: req.file.mimetype
    });

    // Fallback: local OCR + heuristics (works best for printed/clear scans)
    let summary = llmResult?.summary;
    if (!summary) {
      const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
      summary = parsePrescriptionSummary(extractedText);
    }

    res.status(201).json({
      message: 'Prescription analyzed successfully',
      document,
      summary
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
