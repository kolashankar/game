/**
 * TimeRift Model
 * Represents a time rift in a timeline within the ChronoCore game
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeRift = sequelize.define('TimeRift', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    timelineId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'timelines',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    realmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'realms',
        key: 'id'
      },
      comment: 'The realm where the rift is located, if applicable'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    severity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5
      }
    },
    coordinates: {
      type: DataTypes.JSONB,
      defaultValue: {
        x: 0,
        y: 0
      }
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      },
      comment: 'The player who resolved this rift'
    },
    createdAtTurn: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resolvedAtTurn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    effects: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    aiRiftId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the time rift in the AI engine'
    }
  }, {
    timestamps: true,
    tableName: 'time_rifts',
    paranoid: true // Soft deletes
  });

  TimeRift.associate = (models) => {
    // A time rift belongs to a timeline
    TimeRift.belongsTo(models.Timeline, {
      foreignKey: 'timelineId',
      as: 'timeline'
    });

    // A time rift belongs to a game
    TimeRift.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    });

    // A time rift may be located in a realm
    TimeRift.belongsTo(models.Realm, {
      foreignKey: 'realmId',
      as: 'realm'
    });

    // A time rift may be resolved by a player
    TimeRift.belongsTo(models.Player, {
      foreignKey: 'resolvedById',
      as: 'resolvedBy'
    });
  };

  return TimeRift;
};
