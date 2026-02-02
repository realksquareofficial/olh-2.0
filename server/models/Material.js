const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    default: 'No description provided'
  },
  source: {
    type: String,
    enum: ['internet', 'written', 'others'],
    default: 'others'
  },
  regulationYear: {
    type: String,
    enum: ['2019', '2023', 'other'],
    required: true
  },
  materialType: {
    type: String,
    enum: ['notes', 'question-paper', 'syllabus', 'reference-book', 'other'],
    default: 'other'
  },
  fileHash: { 
    type: String, 
    required: true, 
    unique: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  rejectionReason: String,
  views: { 
    type: Number, 
    default: 0 
  },
  trustScore: { 
    type: Number, 
    default: 0 
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  linkedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }
}, { 
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);