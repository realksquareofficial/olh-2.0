const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  materialType: {
    type: String,
    enum: ['notes', 'question-paper', 'syllabus', 'reference-book', 'other'],
    default: 'other'
  },
  regulationYear: {
    type: String,
    enum: ['2019', '2023'],
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'closed'],
    default: 'open'
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);