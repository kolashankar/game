/**
 * Timeline Model
 * Represents a timeline in the ChronoCore game
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Timeline = sequelize.define('Timeline', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stability: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: {
        min: 0,
        max: 100
      }
    },
    aiTimelineId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the timeline in the AI engine'
    },
    events: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    properties: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'timelines',
    paranoid: true // Soft deletes
  });

  Timeline.associate = (models) => {
    // A timeline belongs to a game
    Timeline.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    });

    // A timeline has many realms
    Timeline.hasMany(models.Realm, {
      foreignKey: 'timelineId',
      as: 'realms'
    });

    // A timeline has many time rifts
    Timeline.hasMany(models.TimeRift, {
      foreignKey: 'timelineId',
      as: 'timeRifts'
    });
  };

  return Timeline;
};
