/**
 * AI Log Schema
 * Stores logs of AI engine interactions and decisions
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the AI log schema
const aiLogSchema = new Schema({
  gameId: {
    type: String,
    required: true,
    index: true
  },
  playerId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    enum: ['decision', 'quest', 'event', 'timeRift', 'worldState', 'error'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: Object,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  turn: {
    type: Number
  },
  era: {
    type: String
  },
  processingTime: {
    type: Number,
    comment: 'Time in milliseconds to process the request'
  },
  success: {
    type: Boolean,
    default: true
  },
  error: {
    type: Object
  }
}, {
  timestamps: true,
  collection: 'ai_logs'
});

// Create indexes for better query performance
aiLogSchema.index({ gameId: 1, type: 1 });
aiLogSchema.index({ gameId: 1, playerId: 1 });
aiLogSchema.index({ createdAt: -1 });

// Static method to log a decision
aiLogSchema.statics.logDecision = async function(data) {
  return this.create({
    ...data,
    type: 'decision'
  });
};

// Static method to log a quest
aiLogSchema.statics.logQuest = async function(data) {
  return this.create({
    ...data,
    type: 'quest'
  });
};

// Static method to log an error
aiLogSchema.statics.logError = async function(data) {
  return this.create({
    ...data,
    type: 'error',
    success: false
  });
};

// Create and export the model
const AILog = mongoose.model('AILog', aiLogSchema);

module.exports = AILog;
