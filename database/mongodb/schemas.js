/**
 * MongoDB Schemas for ChronoCore
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Game State Schema
const gameStateSchema = new Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  aiGameStateId: {
    type: String,
    required: true
  },
  currentState: {
    type: Object,
    required: true,
    default: {}
  },
  timelines: [{
    timelineId: String,
    name: String,
    stability: Number,
    events: [Object],
    realms: [{
      realmId: String,
      name: String,
      ownerId: String,
      developmentLevel: Number,
      resources: Number,
      population: Number,
      coordinates: {
        x: Number,
        y: Number
      }
    }]
  }],
  players: [{
    playerId: String,
    name: String,
    role: String,
    karma: Number,
    resources: Number,
    controlledRealms: [String],
    decisions: [Object]
  }],
  timeRifts: [{
    riftId: String,
    timelineId: String,
    severity: Number,
    description: String,
    coordinates: {
      x: Number,
      y: Number
    },
    resolved: Boolean,
    resolvedById: String
  }],
  worldEvents: [{
    eventId: String,
    type: String,
    description: String,
    turn: Number,
    era: String,
    affectedEntities: [String]
  }],
  turnHistory: [{
    turn: Number,
    era: String,
    events: [Object],
    globalKarma: Number,
    timestamp: Date
  }],
  gameSettings: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'game_states'
});

// AI Log Schema
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

// Timeline Event Schema
const timelineEventSchema = new Schema({
  gameId: {
    type: String,
    required: true,
    index: true
  },
  timelineId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['historical', 'player-generated', 'ai-generated', 'divergence'],
    required: true
  },
  turn: {
    type: Number,
    required: true
  },
  era: {
    type: String,
    required: true
  },
  impact: {
    ethical: Number,
    technological: Number,
    temporal: Number
  },
  affectedRealms: [String],
  causedBy: {
    playerId: String,
    decisionId: String
  },
  consequences: [Object],
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'timeline_events'
});

// Player Analytics Schema
const playerAnalyticsSchema = new Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  gameId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  decisionPatterns: {
    ethical: Number,
    technological: Number,
    diplomatic: Number,
    aggressive: Number
  },
  questCompletion: {
    completed: Number,
    failed: Number,
    expired: Number,
    avgTimeToComplete: Number
  },
  karmaHistory: [{
    turn: Number,
    value: Number,
    change: Number,
    reason: String
  }],
  realmManagement: {
    acquired: Number,
    lost: Number,
    avgDevelopmentLevel: Number,
    maxDevelopmentLevel: Number
  },
  timeRifts: {
    created: Number,
    resolved: Number
  },
  playStyle: {
    type: String,
    enum: ['diplomat', 'conqueror', 'scientist', 'balanced', 'chaotic', 'unknown'],
    default: 'unknown'
  },
  sessionData: [{
    date: Date,
    duration: Number,
    actionsPerformed: Number
  }]
}, {
  timestamps: true,
  collection: 'player_analytics'
});

// Create models
const GameState = mongoose.model('GameState', gameStateSchema);
const AILog = mongoose.model('AILog', aiLogSchema);
const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
const PlayerAnalytics = mongoose.model('PlayerAnalytics', playerAnalyticsSchema);

module.exports = {
  GameState,
  AILog,
  TimelineEvent,
  PlayerAnalytics
};
