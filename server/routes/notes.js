const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const Course = require('../models/Course');

const verifyCourseAccess = async (courseId, userId) => {
  const course = await Course.findOne({ _id: courseId, userId });
  return !!course;
};

// @route   GET api/notes/:courseId
// @desc    Get note for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    let note = await Note.findOne({ courseId: req.params.courseId });
    if (!note) {
      // Return a blank note representation instead of failing
      note = {
        courseId: req.params.courseId,
        content: ''
      };
    }

    res.json(note);
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

// @route   POST api/notes/:courseId
// @desc    Upsert (save/update) note for a course
// @access  Private
router.post('/:courseId', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const note = await Note.findOneAndUpdate(
      { courseId: req.params.courseId },
      { 
        userId: req.user.id,
        content: content !== undefined ? content : '' 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(note);
  } catch (error) {
    console.error('Upsert notes error:', error);
    res.status(500).json({ message: 'Server error saving notes' });
  }
});

module.exports = router;
