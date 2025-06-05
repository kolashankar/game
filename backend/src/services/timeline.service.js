/**
 * Timeline Service
 * Handles timeline operations and management
 */

const { Timeline, Realm, TimeRift, Game } = require('../database/models');
const { GameState } = require('../database/mongodb/schemas');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

class TimelineService {
  /**
   * Get a timeline by ID with related data
   * @param {string} timelineId - Timeline ID
   * @returns {Object} Timeline with related data
   */
  async getTimelineById(timelineId) {
    try {
      const timeline = await Timeline.findByPk(timelineId, {
        include: [
          { model: Realm, as: 'realms' },
          { model: TimeRift, as: 'timeRifts' },
          { model: Game, as: 'game' }
        ]
      });

      if (!timeline) {
        throw new Error('Timeline not found');
      }

      return timeline;
    } catch (error) {
      logger.error('Error getting timeline by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new timeline
   * @param {Object} timelineData - Timeline data
   * @returns {Object} Newly created timeline
   */
  async createTimeline(timelineData) {
    try {
      // Create the timeline
      const timeline = await Timeline.create(timelineData);

      // Get the game
      const game = await Game.findByPk(timeline.gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Register the timeline with the AI engine
      const aiTimeline = await aiService.createTimeline(
        game.aiGameStateId,
        timeline.id,
        timeline.name,
        timeline.description
      );

      // Update the timeline with the AI timeline ID
      timeline.aiTimelineId = aiTimeline.id;
      await timeline.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { gameId: game.id },
        { 
          $push: { 
            timelines: {
              timelineId: timeline.id,
              name: timeline.name,
              stability: timeline.stability,
              events: []
            }
          }
        },
        { new: true }
      );

      return timeline;
    } catch (error) {
      logger.error('Error creating timeline:', error);
      throw error;
    }
  }

  /**
   * Update timeline stability
   * @param {string} timelineId - Timeline ID
   * @param {number} stabilityChange - Amount to change stability (can be negative)
   * @returns {Object} Updated timeline
   */
  async updateStability(timelineId, stabilityChange) {
    try {
      const timeline = await Timeline.findByPk(timelineId);
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Update stability
      timeline.stability += stabilityChange;

      // Ensure stability stays within bounds
      if (timeline.stability > 100) {
        timeline.stability = 100;
      } else if (timeline.stability < 0) {
        timeline.stability = 0;
      }

      await timeline.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { gameId: timeline.gameId, 'timelines.timelineId': timeline.id },
        { $set: { 'timelines.$.stability': timeline.stability } },
        { new: true }
      );

      // If stability is very low, generate a time rift
      if (timeline.stability < 30 && Math.random() < 0.3) {
        // Get the game
        const game = await Game.findByPk(timeline.gameId);
        if (game) {
          await this.generateTimeRift(timeline.id, game.aiGameStateId);
        }
      }

      return timeline;
    } catch (error) {
      logger.error('Error updating timeline stability:', error);
      throw error;
    }
  }

  /**
   * Generate a time rift in a timeline
   * @param {string} timelineId - Timeline ID
   * @param {string} aiGameStateId - AI game state ID
   * @returns {Object} Generated time rift
   */
  async generateTimeRift(timelineId, aiGameStateId) {
    try {
      // Get the timeline
      const timeline = await Timeline.findByPk(timelineId, {
        include: [{ model: Game, as: 'game' }]
      });
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Generate a time rift with the AI engine
      const aiRift = await aiService.generateTimeRift(aiGameStateId, timelineId);

      // Create a time rift record
      const timeRift = await TimeRift.create({
        timelineId,
        gameId: timeline.game.id,
        description: aiRift.description,
        severity: aiRift.severity,
        coordinates: aiRift.coordinates,
        resolved: false,
        createdAtTurn: timeline.game.currentTurn,
        aiRiftId: aiRift.id,
        effects: aiRift.effects
      });

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { gameId: timeline.game.id },
        { 
          $push: { 
            timeRifts: {
              riftId: timeRift.id,
              timelineId: timeRift.timelineId,
              severity: timeRift.severity,
              description: timeRift.description,
              coordinates: timeRift.coordinates,
              resolved: false
            }
          }
        },
        { new: true }
      );

      return timeRift;
    } catch (error) {
      logger.error('Error generating time rift:', error);
      throw error;
    }
  }

  /**
   * Resolve a time rift
   * @param {string} riftId - Time rift ID
   * @param {string} playerId - Player ID resolving the rift
   * @returns {Object} Resolved time rift
   */
  async resolveTimeRift(riftId, playerId) {
    try {
      // Get the time rift
      const timeRift = await TimeRift.findByPk(riftId, {
        include: [
          { model: Timeline, as: 'timeline' },
          { model: Game, as: 'game' }
        ]
      });
      
      if (!timeRift) {
        throw new Error('Time rift not found');
      }

      // Check if the rift is already resolved
      if (timeRift.resolved) {
        throw new Error('Time rift is already resolved');
      }

      // Resolve the rift
      timeRift.resolved = true;
      timeRift.resolvedById = playerId;
      timeRift.resolvedAtTurn = timeRift.game.currentTurn;
      await timeRift.save();

      // Update timeline stability
      await this.updateStability(timeRift.timelineId, 10 + (5 * timeRift.severity));

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { gameId: timeRift.game.id, 'timeRifts.riftId': timeRift.id },
        { 
          $set: { 
            'timeRifts.$.resolved': true,
            'timeRifts.$.resolvedById': playerId
          }
        },
        { new: true }
      );

      return timeRift;
    } catch (error) {
      logger.error('Error resolving time rift:', error);
      throw error;
    }
  }

  /**
   * Get all timelines for a game
   * @param {string} gameId - Game ID
   * @returns {Array} Timelines
   */
  async getGameTimelines(gameId) {
    try {
      const timelines = await Timeline.findAll({
        where: { gameId },
        include: [
          { model: Realm, as: 'realms' },
          { model: TimeRift, as: 'timeRifts', where: { resolved: false }, required: false }
        ]
      });

      return timelines;
    } catch (error) {
      logger.error('Error getting game timelines:', error);
      throw error;
    }
  }
}

module.exports = new TimelineService();
