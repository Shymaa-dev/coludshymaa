const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx'],
  },
  s3Key: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: String,
  }
});

module.exports = mongoose.model('Document', documentSchema); 