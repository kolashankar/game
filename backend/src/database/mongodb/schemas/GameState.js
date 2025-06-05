/**
 * Game State Schema
 * Stores complex game state data in MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the game state schema
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

// Create indexes for better query performance
gameStateSchema.index({ 'timelines.timelineId': 1 });
gameStateSchema.index({ 'players.playerId': 1 });
gameStateSchema.index({ 'timeRifts.riftId': 1 });

// Add methods to the schema
gameStateSchema.methods.updateTimeline = function(timelineId, updateData) {
  const timelineIndex = this.timelines.findIndex(t => t.timelineId === timelineId);
  if (timelineIndex !== -1) {
    Object.assign(this.timelines[timelineIndex], updateData);
  }
  return this.save();
};

gameStateSchema.methods.updatePlayer = function(playerId, updateData) {
  const playerIndex = this.players.findIndex(p => p.playerId === playerId);
  if (playerIndex !== -1) {
    Object.assign(this.players[playerIndex], updateData);
  }
  return this.save();
};

gameStateSchema.methods.addTurnHistory = function(turnData) {
  this.turnHistory.push({
    ...turnData,
    timestamp: new Date()
  });
  return this.save();
};

// Create and export the model
const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
