const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WhiteboardState = require('../models/WhiteboardState');
const Course = require('../models/Course');

const verifyCourseAccess = async (courseId, userId) => {
  const course = await Course.findOne({ _id: courseId, userId });
  return !!course;
};

// @route   GET api/whiteboard/:courseId
// @desc    Get whiteboard JSON state for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    let whiteboard = await WhiteboardState.findOne({ courseId: req.params.courseId });
    if (!whiteboard) {
      whiteboard = {
        courseId: req.params.courseId,
        canvasJSON: '[]'
      };
    }

    res.json(whiteboard);
  } catch (error) {
    console.error('Fetch whiteboard error:', error);
    res.status(500).json({ message: 'Server error fetching whiteboard' });
  }
});

// @route   POST api/whiteboard/:courseId
// @desc    Upsert (save/update) whiteboard canvas state
// @access  Private
router.post('/:courseId', auth, async (req, res) => {
  const { canvasJSON } = req.body;

  if (canvasJSON === undefined) {
    return res.status(400).json({ message: 'canvasJSON string is required' });
  }

  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const whiteboard = await WhiteboardState.findOneAndUpdate(
      { courseId: req.params.courseId },
      { 
        userId: req.user.id,
        canvasJSON 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(whiteboard);
  } catch (error) {
    console.error('Upsert whiteboard error:', error);
    res.status(500).json({ message: 'Server error saving whiteboard' });
  }
});

module.exports = router;
