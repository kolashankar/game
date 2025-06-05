/**
 * Models Index
 * Handles model initialization and associations in the correct order
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.config');

// Import model definitions
const { User } = require('./user.model');
const { 
  Game, 
  GamePlayer, 
  GameEvent, 
  Timeline, 
  Realm 
} = require('./game.model');

// Function to sync models in the correct order
const syncModels = async (force = false) => {
  try {
    // Drop tables in reverse dependency order if force is true
    if (force) {
      console.log('Dropping tables in reverse dependency order...');
      await Promise.all([
        sequelize.query('DROP TABLE IF EXISTS realms CASCADE;'),
        sequelize.query('DROP TABLE IF EXISTS timelines CASCADE;'),
        sequelize.query('DROP TABLE IF EXISTS game_events CASCADE;'),
        sequelize.query('DROP TABLE IF EXISTS game_players CASCADE;'),
        sequelize.query('DROP TABLE IF EXISTS games CASCADE;'),
        sequelize.query('DROP TABLE IF EXISTS users CASCADE;')
      ]);
      
      // Drop enums
      await Promise.all([
        sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;'),
        sequelize.query('DROP TYPE IF EXISTS enum_users_preferred_role CASCADE;'),
        sequelize.query('DROP TYPE IF EXISTS enum_games_status CASCADE;'),
        sequelize.query('DROP TYPE IF EXISTS enum_games_current_era CASCADE;'),
        sequelize.query('DROP TYPE IF EXISTS enum_game_players_role CASCADE;')
      ]);
    }

    // Create enum types first
    console.log('Creating enum types...');
    await Promise.all([
      sequelize.query(`DO $$ BEGIN
        CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;`),
      sequelize.query(`DO $$ BEGIN
        CREATE TYPE "enum_users_preferred_role" AS ENUM ('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;`),
      sequelize.query(`DO $$ BEGIN
        CREATE TYPE "enum_games_status" AS ENUM ('waiting', 'active', 'completed');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;`),
      sequelize.query(`DO $$ BEGIN
        CREATE TYPE "enum_games_current_era" AS ENUM ('Initiation', 'Development', 'Convergence', 'Resolution');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;`),
      sequelize.query(`DO $$ BEGIN
        CREATE TYPE "enum_game_players_role" AS ENUM ('creator', 'player', 'ai');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;`)
    ]);

    // Create tables in dependency order
    console.log('Creating tables in dependency order...');
    await User.sync({ force: false }); // Create users table first
    await Game.sync({ force: false }); // Games depends on users
    await GamePlayer.sync({ force: false }); // GamePlayer depends on both users and games
    await GameEvent.sync({ force: false }); // GameEvent depends on games
    await Timeline.sync({ force: false }); // Timeline depends on games
    await Realm.sync({ force: false }); // Realm depends on timeline and users

    console.log('All models synced successfully');
  } catch (error) {
    console.error('Error syncing models:', error);
    throw error;
  }
};

const initializeAssociations = () => {
  // User-Game associations
  Game.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
  User.hasMany(Game, { as: 'createdGames', foreignKey: 'creatorId' });

  // User-GamePlayer associations (many-to-many through GamePlayer)
  User.hasMany(GamePlayer, { as: 'gameParticipations', foreignKey: 'userId' });
  GamePlayer.belongsTo(User, { as: 'user', foreignKey: 'userId' });
  
  Game.hasMany(GamePlayer, { as: 'players', foreignKey: 'gameId' });
  GamePlayer.belongsTo(Game, { as: 'game', foreignKey: 'gameId' });

  // Game-related associations
  Game.hasMany(GameEvent, { as: 'events', foreignKey: 'gameId' });
  GameEvent.belongsTo(Game, { as: 'game', foreignKey: 'gameId' });

  Game.hasMany(Timeline, { as: 'timelines', foreignKey: 'gameId' });
  Timeline.belongsTo(Game, { as: 'game', foreignKey: 'gameId' });

  Timeline.hasMany(Realm, { as: 'realms', foreignKey: 'timelineId' });
  Realm.belongsTo(Timeline, { as: 'timeline', foreignKey: 'timelineId' });

  // Realm owner association
  Realm.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
  User.hasMany(Realm, { as: 'ownedRealms', foreignKey: 'ownerId' });
};

// Initialize all associations
initializeAssociations();

module.exports = {
  sequelize,
  syncModels,
  User,
  Game,
  GamePlayer,
  GameEvent,
  Timeline,
  Realm
};