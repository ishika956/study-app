const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Target = require('../models/Target');
const Note = require('../models/Note');
const WhiteboardState = require('../models/WhiteboardState');
const Document = require('../models/Document');

// @route   GET api/courses
// @desc    Get all courses for logged-in user with their target completion %
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // Enrich courses with calculated progress completion percentage
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        const targets = await Target.find({ courseId: course._id });
        const totalTargets = targets.length;
        const completedTargets = targets.filter(t => t.isDone).length;
        const completionRate = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;
        
        return {
          _id: course._id,
          name: course.name,
          createdAt: course.createdAt,
          completion: completionRate,
          totalTargets,
          completedTargets
        };
      })
    );

    res.json(enrichedCourses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// @route   POST api/courses
// @desc    Create a new course
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Course name is required' });
  }

  try {
    const newCourse = new Course({
      name: name.trim(),
      userId: req.user.id
    });

    const savedCourse = await newCourse.save();
    
    // Return with 0% initial completion
    res.status(201).json({
      _id: savedCourse._id,
      name: savedCourse.name,
      createdAt: savedCourse.createdAt,
      completion: 0,
      totalTargets: 0,
      completedTargets: 0
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
});

// @route   DELETE api/courses/:id
// @desc    Delete a course and all associated data (cascading cleanup)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // 1. Confirm course exists and belongs to the current user
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // 2. Locate and remove all files associated with this course's documents
    const documents = await Document.find({ courseId: course._id });
    for (const doc of documents) {
      const filePath = path.join(__dirname, '../uploads', doc.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${doc.filename}:`, err);
        }
      }
    }

    // 3. Delete database records for related models
    await Document.deleteMany({ courseId: course._id });
    await Target.deleteMany({ courseId: course._id });
    await Note.deleteMany({ courseId: course._id });
    await WhiteboardState.deleteMany({ courseId: course._id });

    // 4. Delete the course itself
    await Course.deleteOne({ _id: course._id });

    res.json({ message: 'Course and all associated materials deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

module.exports = router;
