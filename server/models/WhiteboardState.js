const mongoose = require('mongoose');

const WhiteboardStateSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  canvasJSON: {
    type: String,
    default: '[]'
  }
});

module.exports = mongoose.model('WhiteboardState', WhiteboardStateSchema);
