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
const { analyzeWithGeminiVision } = require('../services/prescriptionAnalyzer');

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

// Memory-only upload (used for analysis so files are NOT stored on disk or in DB)
const analyzeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|pdf/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed for prescription analysis'));
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

const preprocessImageBufferForOcr = async (buffer) => {
  const img = sharp(buffer, { failOnError: false }).rotate();
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

const extractTextFromUpload = async ({ buffer, mimeType }) => {
  if (mimeType === 'application/pdf') {
    try {
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
  const imageBuffer = await preprocessImageBufferForOcr(buffer);

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
  const durationPattern = /\b(\d+)\s*(day|days|d|week|weeks|w|month|months|m)\b/i;
  const reasonPattern = /\b(dx|diagnosis|diag|complaint|c\/o|chief complaint|indication|for)\b/i;
  const patientPattern = /\b(patient|name)\b/i;
  const doctorPattern = /\bdr\.?\b|\bmbbs|md|ms|bds\b/i;
  const hospitalPattern = /\b(hospital|clinic|medical|centre|center|pharmacy|dispensary)\b/i;

  const headerLines = lines.slice(0, 12);
  const hospitalLine =
    headerLines.find(l => hospitalPattern.test(l)) ||
    'Not found';

  const doctorLine =
    headerLines.find(l => doctorPattern.test(l)) ||
    'Not found';

  // Patient name (best-effort). We try explicit labels first; otherwise look for common honorifics.
  const patientLineCandidate =
    headerLines.find((l) => /^\s*(patient\s*name|patient|name)\s*[:\-]/i.test(l)) ||
    headerLines.find((l) => patientPattern.test(l) && !doctorPattern.test(l) && !hospitalPattern.test(l)) ||
    headerLines.find((l) => /\b(mr|mrs|ms|miss|master)\.?\b/i.test(l) && !doctorPattern.test(l) && !hospitalPattern.test(l)) ||
    '';

  const patientName = (() => {
    if (!patientLineCandidate) return 'Not found';
    const cleaned = patientLineCandidate
      .replace(/^\s*(patient\s*name|patient|name)\s*[:\-]?\s*/i, '')
      .replace(/[^\w\s,./()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Avoid accidentally returning doctor/hospital lines
    if (!cleaned) return 'Not found';
    if (doctorPattern.test(cleaned) || hospitalPattern.test(cleaned)) return 'Not found';
    // Very short tokens are usually noise in OCR
    if (cleaned.length < 3) return 'Not found';
    return cleaned;
  })();

  // Diagnosis / Reason (best-effort heuristic; handwriting OCR can be noisy)
  const reasonLine = lines.find((l) => reasonPattern.test(l)) || '';
  const reason = (() => {
    if (!reasonLine) return 'Not found';
    // Remove the label (Dx/Diagnosis/etc.) and keep the remaining phrase
    const cleaned = reasonLine
      .replace(/^\s*(dx|diagnosis|diag|complaint|c\/o|chief complaint|indication|for)\s*[:\-]?\s*/i, '')
      .replace(/[^\w\s,./()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || 'Not found';
  })();

  // Candidate medicine lines: look for dosage patterns OR medicine hints
  const medicineCandidates = lines.filter((l) => {
    if (!(dosagePattern.test(l) || medicineHint.test(l))) return false;
    // Exclude header-y lines that tend to pollute medicine extraction
    if (hospitalPattern.test(l) || doctorPattern.test(l) || patientPattern.test(l)) return false;
    if (reasonPattern.test(l) && !medicineHint.test(l)) return false;
    return true;
  });

  // Extract medicine-like phrase from a line (simple heuristic)
  const extractMedicineFromLine = (line) => {
    // Remove obvious noise
    const cleaned = line
      .replace(/(rx|prescription|diagnosis|dx|sig|take|daily|morning|night)/gi, '')
      .replace(dosagePattern, '')
      .replace(durationPattern, '')
      .replace(/\b(\d+)\s*(mg|ml)\b/gi, '')
      .replace(/\b(tab|tablet|cap|capsule|syrup|inj|injection)\b/gi, '')
      .replace(/[^\w\s.+-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Prefer first 2-4 tokens that look like a drug name
    const tokens = cleaned.split(' ').filter(Boolean);
    const picked = tokens.slice(0, 5).join(' ');
    return picked || null;
  };

  const parseMedicineRow = (line) => {
    const durationMatch =
      line.match(/\b(?:x|for)\s*(\d+)\s*(?:day|days|d|week|weeks|w|month|months|m)?\b/i) ||
      line.match(durationPattern) ||
      text.match(durationPattern);
    const doseTokenMatch = line.match(dosagePattern);
    const strengthMatch = line.match(/\b(\d+)\s*(mg|ml)\b/i);

    const days = durationMatch ? durationMatch[1] : 'Not found';
    const dosage =
      [strengthMatch ? strengthMatch[0] : null, doseTokenMatch ? doseTokenMatch[0] : null]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Not found';
    const name = extractMedicineFromLine(line) || 'Not found';
    return { medicineName: name, dosage, days };
  };

  const medicines = medicineCandidates
    .map(parseMedicineRow)
    .filter(m => m.medicineName && m.medicineName !== 'Not found')
    .slice(0, 10);

  return {
    patientName,
    doctorName: doctorLine,
    hospitalName: hospitalLine,
    reason,
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
router.post('/analyze-prescription', auth, analyzeUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Prefer Gemini Vision for images when configured (best for handwriting).
    // For PDFs/docs or when GEMINI_API_KEY is not set, fallback to local OCR + heuristics.
    let summary = null;
    if (process.env.GEMINI_API_KEY && /^image\//i.test(req.file.mimetype)) {
      try {
        const gemini = await analyzeWithGeminiVision({ buffer: req.file.buffer });
        if (gemini?.summary) {
          summary = gemini.summary;
        }
      } catch (e) {
        console.warn('Gemini Vision analyze failed, falling back to local OCR:', e.message);
      }
    }

    if (!summary) {
      const extractedText = await extractTextFromUpload({ buffer: req.file.buffer, mimeType: req.file.mimetype });
      summary = parsePrescriptionSummary(extractedText);
    }

    res.status(201).json({
      message: 'Prescription analyzed successfully',
      summary,
      transient: true
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
