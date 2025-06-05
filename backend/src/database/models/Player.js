/**
 * Player Model
 * Represents a player in a specific game session
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('Player', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    karma: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    resources: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isReady: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastAction: {
      type: DataTypes.DATE,
      allowNull: true
    },
    aiPlayerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the player in the AI engine'
    },
    stats: {
      type: DataTypes.JSONB,
      defaultValue: {
        questsCompleted: 0,
        decisionsCount: 0,
        realmsControlled: 0,
        timeRiftsResolved: 0
      }
    }
  }, {
    timestamps: true,
    tableName: 'players',
    paranoid: true // Soft deletes
  });

  Player.associate = (models) => {
    // A player belongs to a user
    Player.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // A player belongs to a game
    Player.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    });

    // A player has many quests
    Player.hasMany(models.Quest, {
      foreignKey: 'playerId',
      as: 'quests'
    });

    // A player controls many realms
    Player.hasMany(models.Realm, {
      foreignKey: 'ownerId',
      as: 'controlledRealms'
    });

    // A player has many decisions
    Player.hasMany(models.Decision, {
      foreignKey: 'playerId',
      as: 'decisions'
    });
  };

  return Player;
};
