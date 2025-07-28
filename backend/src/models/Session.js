const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const generatedCodeSchema = new mongoose.Schema({
  jsx: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    maxlength: [100, 'Session name cannot be more than 100 characters']
  },
  messages: [chatMessageSchema],
  generatedCode: {
    type: generatedCodeSchema,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ user: 1, updatedAt: -1 });

// Virtual for message count
sessionSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Ensure virtual fields are serialized
sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Session', sessionSchema); 