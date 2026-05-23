const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Target = require('../models/Target');
const Course = require('../models/Course');

// Utility to verify course ownership
const verifyCourseAccess = async (courseId, userId) => {
  const course = await Course.findOne({ _id: courseId, userId });
  return !!course;
};

// @route   GET api/targets/:courseId
// @desc    Get all targets for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const targets = await Target.find({ courseId: req.params.courseId });
    res.json(targets);
  } catch (error) {
    console.error('Fetch targets error:', error);
    res.status(500).json({ message: 'Server error fetching targets' });
  }
});

// @route   POST api/targets/:courseId
// @desc    Create a new target for a course
// @access  Private
router.post('/:courseId', auth, async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Target title is required' });
  }

  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const newTarget = new Target({
      courseId: req.params.courseId,
      userId: req.user.id,
      title: title.trim(),
      isDone: false
    });

    const savedTarget = await newTarget.save();
    res.status(201).json(savedTarget);
  } catch (error) {
    console.error('Create target error:', error);
    res.status(500).json({ message: 'Server error creating target' });
  }
});

// @route   PATCH api/targets/:courseId/:targetId
// @desc    Toggle/update a target's completion status
// @access  Private
router.patch('/:courseId/:targetId', auth, async (req, res) => {
  const { isDone } = req.body;

  if (isDone === undefined) {
    return res.status(400).json({ message: 'isDone status is required' });
  }

  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const target = await Target.findOne({ _id: req.params.targetId, courseId: req.params.courseId });
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }

    target.isDone = isDone;
    const updatedTarget = await target.save();
    res.json(updatedTarget);
  } catch (error) {
    console.error('Update target error:', error);
    res.status(500).json({ message: 'Server error updating target' });
  }
});

// @route   DELETE api/targets/:courseId/:targetId
// @desc    Delete a target
// @access  Private
router.delete('/:courseId/:targetId', auth, async (req, res) => {
  try {
    const hasAccess = await verifyCourseAccess(req.params.courseId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const result = await Target.deleteOne({ _id: req.params.targetId, courseId: req.params.courseId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Target not found' });
    }

    res.json({ message: 'Target deleted successfully' });
  } catch (error) {
    console.error('Delete target error:', error);
    res.status(500).json({ message: 'Server error deleting target' });
  }
});

module.exports = router;
