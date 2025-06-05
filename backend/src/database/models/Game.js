/**
 * Game Model
 * Represents a game session in ChronoCore
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    joinCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('created', 'active', 'paused', 'completed'),
      defaultValue: 'created'
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 6,
      validate: {
        min: 2,
        max: 10
      }
    },
    currentEra: {
      type: DataTypes.ENUM('Initiation', 'Progression', 'Distortion', 'Equilibrium'),
      defaultValue: 'Initiation'
    },
    currentTurn: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentPlayerIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    globalKarma: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    aiGameStateId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the game state in the AI engine'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'games',
    paranoid: true // Soft deletes
  });

  Game.associate = (models) => {
    // A game belongs to a creator (user)
    Game.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });

    // A game has many players
    Game.hasMany(models.Player, {
      foreignKey: 'gameId',
      as: 'players'
    });

    // A game has many timelines
    Game.hasMany(models.Timeline, {
      foreignKey: 'gameId',
      as: 'timelines'
    });

    // A game has many events
    Game.hasMany(models.GameEvent, {
      foreignKey: 'gameId',
      as: 'events'
    });
  };

  return Game;
};
