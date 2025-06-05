/**
 * Realm Service
 * Handles realm operations and management
 */

const { Realm, Timeline, Player, Game } = require('../database/models');
const { GameState } = require('../database/mongodb/schemas');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

class RealmService {
  /**
   * Get a realm by ID with related data
   * @param {string} realmId - Realm ID
   * @returns {Object} Realm with related data
   */
  async getRealmById(realmId) {
    try {
      const realm = await Realm.findByPk(realmId, {
        include: [
          { model: Timeline, as: 'timeline' },
          { model: Player, as: 'owner' }
        ]
      });

      if (!realm) {
        throw new Error('Realm not found');
      }

      return realm;
    } catch (error) {
      logger.error('Error getting realm by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new realm
   * @param {Object} realmData - Realm data
   * @returns {Object} Newly created realm
   */
  async createRealm(realmData) {
    try {
      // Create the realm
      const realm = await Realm.create(realmData);

      // Get the timeline and game
      const timeline = await Timeline.findByPk(realm.timelineId, {
        include: [{ model: Game, as: 'game' }]
      });
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Register the realm with the AI engine
      const aiRealm = await aiService.createRealm(
        timeline.game.aiGameStateId,
        realm.id,
        realm.name,
        realm.description,
        realm.timelineId,
        realm.ownerId
      );

      // Update the realm with the AI realm ID
      realm.aiRealmId = aiRealm.id;
      await realm.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { gameId: timeline.game.id, 'timelines.timelineId': timeline.id },
        { 
          $push: { 
            'timelines.$.realms': {
              realmId: realm.id,
              name: realm.name,
              ownerId: realm.ownerId,
              developmentLevel: realm.developmentLevel,
              resources: realm.resources,
              population: realm.population,
              coordinates: realm.coordinates
            }
          }
        },
        { new: true }
      );

      // If the realm has an owner, update their stats
      if (realm.ownerId) {
        const player = await Player.findByPk(realm.ownerId);
        if (player) {
          player.stats.realmsControlled += 1;
          await player.save();
        }
      }

      return realm;
    } catch (error) {
      logger.error('Error creating realm:', error);
      throw error;
    }
  }

  /**
   * Update realm development level
   * @param {string} realmId - Realm ID
   * @param {number} levelChange - Amount to change development level (can be negative)
   * @returns {Object} Updated realm
   */
  async updateDevelopmentLevel(realmId, levelChange) {
    try {
      const realm = await Realm.findByPk(realmId, {
        include: [
          { model: Timeline, as: 'timeline', include: [{ model: Game, as: 'game' }] }
        ]
      });
      
      if (!realm) {
        throw new Error('Realm not found');
      }

      // Update development level
      realm.developmentLevel += levelChange;

      // Ensure development level stays within bounds
      if (realm.developmentLevel > 10) {
        realm.developmentLevel = 10;
      } else if (realm.developmentLevel < 1) {
        realm.developmentLevel = 1;
      }

      await realm.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { 
          gameId: realm.timeline.game.id, 
          'timelines.timelineId': realm.timelineId,
          'timelines.realms.realmId': realm.id 
        },
        { 
          $set: { 
            'timelines.$[timeline].realms.$[realm].developmentLevel': realm.developmentLevel
          }
        },
        { 
          arrayFilters: [
            { 'timeline.timelineId': realm.timelineId },
            { 'realm.realmId': realm.id }
          ],
          new: true
        }
      );

      return realm;
    } catch (error) {
      logger.error('Error updating realm development level:', error);
      throw error;
    }
  }

  /**
   * Update realm resources
   * @param {string} realmId - Realm ID
   * @param {number} resourceChange - Amount to change resources (can be negative)
   * @returns {Object} Updated realm
   */
  async updateResources(realmId, resourceChange) {
    try {
      const realm = await Realm.findByPk(realmId, {
        include: [
          { model: Timeline, as: 'timeline', include: [{ model: Game, as: 'game' }] }
        ]
      });
      
      if (!realm) {
        throw new Error('Realm not found');
      }

      // Update resources
      realm.resources += resourceChange;

      // Ensure resources don't go below zero
      if (realm.resources < 0) {
        realm.resources = 0;
      }

      await realm.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { 
          gameId: realm.timeline.game.id, 
          'timelines.timelineId': realm.timelineId,
          'timelines.realms.realmId': realm.id 
        },
        { 
          $set: { 
            'timelines.$[timeline].realms.$[realm].resources': realm.resources
          }
        },
        { 
          arrayFilters: [
            { 'timeline.timelineId': realm.timelineId },
            { 'realm.realmId': realm.id }
          ],
          new: true
        }
      );

      return realm;
    } catch (error) {
      logger.error('Error updating realm resources:', error);
      throw error;
    }
  }

  /**
   * Update realm population
   * @param {string} realmId - Realm ID
   * @param {number} populationChange - Amount to change population (can be negative)
   * @returns {Object} Updated realm
   */
  async updatePopulation(realmId, populationChange) {
    try {
      const realm = await Realm.findByPk(realmId, {
        include: [
          { model: Timeline, as: 'timeline', include: [{ model: Game, as: 'game' }] }
        ]
      });
      
      if (!realm) {
        throw new Error('Realm not found');
      }

      // Update population
      realm.population += populationChange;

      // Ensure population doesn't go below zero
      if (realm.population < 0) {
        realm.population = 0;
      }

      await realm.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { 
          gameId: realm.timeline.game.id, 
          'timelines.timelineId': realm.timelineId,
          'timelines.realms.realmId': realm.id 
        },
        { 
          $set: { 
            'timelines.$[timeline].realms.$[realm].population': realm.population
          }
        },
        { 
          arrayFilters: [
            { 'timeline.timelineId': realm.timelineId },
            { 'realm.realmId': realm.id }
          ],
          new: true
        }
      );

      return realm;
    } catch (error) {
      logger.error('Error updating realm population:', error);
      throw error;
    }
  }

  /**
   * Change realm owner
   * @param {string} realmId - Realm ID
   * @param {string} newOwnerId - New owner player ID
   * @returns {Object} Updated realm
   */
  async changeOwner(realmId, newOwnerId) {
    try {
      const realm = await Realm.findByPk(realmId, {
        include: [
          { model: Timeline, as: 'timeline', include: [{ model: Game, as: 'game' }] },
          { model: Player, as: 'owner' }
        ]
      });
      
      if (!realm) {
        throw new Error('Realm not found');
      }

      // Get the new owner
      const newOwner = await Player.findByPk(newOwnerId);
      if (!newOwner) {
        throw new Error('New owner not found');
      }

      // Check if the new owner is in the same game
      if (newOwner.gameId !== realm.timeline.game.id) {
        throw new Error('New owner is not in the same game');
      }

      // Update the previous owner's stats if there was one
      if (realm.ownerId) {
        const previousOwner = realm.owner;
        if (previousOwner) {
          previousOwner.stats.realmsControlled -= 1;
          await previousOwner.save();
        }
      }

      // Update the realm owner
      realm.ownerId = newOwnerId;
      await realm.save();

      // Update the new owner's stats
      newOwner.stats.realmsControlled += 1;
      await newOwner.save();

      // Update the game state in MongoDB
      await GameState.findOneAndUpdate(
        { 
          gameId: realm.timeline.game.id, 
          'timelines.timelineId': realm.timelineId,
          'timelines.realms.realmId': realm.id 
        },
        { 
          $set: { 
            'timelines.$[timeline].realms.$[realm].ownerId': newOwnerId
          }
        },
        { 
          arrayFilters: [
            { 'timeline.timelineId': realm.timelineId },
            { 'realm.realmId': realm.id }
          ],
          new: true
        }
      );

      return realm;
    } catch (error) {
      logger.error('Error changing realm owner:', error);
      throw error;
    }
  }

  /**
   * Get all realms for a timeline
   * @param {string} timelineId - Timeline ID
   * @returns {Array} Realms
   */
  async getTimelineRealms(timelineId) {
    try {
      const realms = await Realm.findAll({
        where: { timelineId },
        include: [{ model: Player, as: 'owner' }]
      });

      return realms;
    } catch (error) {
      logger.error('Error getting timeline realms:', error);
      throw error;
    }
  }
}

module.exports = new RealmService();
