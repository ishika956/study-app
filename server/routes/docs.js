const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const Course = require('../models/Course');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure uploads directory exists recursively
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create upload instance
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

const verifyCourseAccess = async (courseId, userId) => {
  const course = await Course.findOne({ _id: courseId, userId });
  return !!course;
};

// @route   GET api/docs/:courseId
// @desc    Get all documents for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const docs = await Document.find({ courseId: req.params.courseId }).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

// @route   POST api/docs/:courseId
// @desc    Upload a document linked to a course
// @access  Private
router.post('/:courseId', auth, upload.single('file'), async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      // Remove uploaded file if access denied
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload' });
    }

    const newDoc = new Document({
      courseId: req.params.courseId,
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname
    });

    const savedDoc = await newDoc.save();
    res.status(201).json(savedDoc);
  } catch (error) {
    console.error('Upload document error:', error);
    // Cleanup file in case of crash
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: 'Server error uploading file' });
  }
});

// @route   DELETE api/docs/:courseId/:docId
// @desc    Delete a document file and its DB entry
// @access  Private
router.delete('/:courseId/:docId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const doc = await Document.findOne({ _id: req.params.docId, courseId: req.params.courseId });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from disk storage
    const filePath = path.join(__dirname, '../uploads', doc.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file ${doc.filename}:`, err);
      }
    }

    // Delete record from Database
    await Document.deleteOne({ _id: doc._id });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

// @route   GET api/docs/download/:docId
// @desc    Securely download an uploaded document file
// @access  Private
router.get('/download/:docId', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Secure verification: ensure this file belongs to the logged-in user
    if (doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to download this file' });
    }

    const filePath = path.join(__dirname, '../uploads', doc.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on server' });
    }

    // Send down file using its original name
    res.download(filePath, doc.originalName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Server error executing download' });
  }
});

module.exports = router;
