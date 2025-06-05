/**
 * GameEvent Model
 * Represents an event that occurred in a game session
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GameEvent = sequelize.define('GameEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      },
      comment: 'The player who triggered this event, if applicable'
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    affectedPlayers: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    affectedRealms: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    affectedTimelines: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    karmaImpact: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    turn: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'game_events',
    paranoid: true // Soft deletes
  });

  GameEvent.associate = (models) => {
    // An event belongs to a game
    GameEvent.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    });

    // An event may be triggered by a player
    GameEvent.belongsTo(models.Player, {
      foreignKey: 'playerId',
      as: 'player'
    });
  };

  return GameEvent;
};
