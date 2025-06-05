/**
 * Realm Model
 * Represents a realm in a timeline within the ChronoCore game
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Realm = sequelize.define('Realm', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      },
      comment: 'The player who controls this realm'
    },
    developmentLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    technologyFocus: {
      type: DataTypes.ENUM('Balanced', 'Military', 'Scientific', 'Cultural', 'Economic', 'Spiritual', 'Ecological'),
      defaultValue: 'Balanced'
    },
    ethicalAlignment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: -100,
        max: 100
      }
    },
    resources: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    population: {
      type: DataTypes.INTEGER,
      defaultValue: 1000000
    },
    aiRealmId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the realm in the AI engine'
    },
    coordinates: {
      type: DataTypes.JSONB,
      defaultValue: {
        x: 0,
        y: 0
      }
    },
    dilemmas: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    properties: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'realms',
    paranoid: true // Soft deletes
  });

  Realm.associate = (models) => {
    // A realm belongs to a timeline
    Realm.belongsTo(models.Timeline, {
      foreignKey: 'timelineId',
      as: 'timeline'
    });

    // A realm may be owned by a player
    Realm.belongsTo(models.Player, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
  };

  return Realm;
};
