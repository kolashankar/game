/**
 * Decision Model
 * Represents a decision made by a player in the ChronoCore game
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Decision = sequelize.define('Decision', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
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
    questId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'quests',
        key: 'id'
      },
      comment: 'Associated quest if this decision is part of a quest'
    },
    decisionText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    context: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    evaluation: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    karmaImpact: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ethicalImpact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    technologicalImpact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    temporalImpact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    affectedRealms: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    affectedTimelines: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    turn: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'decisions',
    paranoid: true // Soft deletes
  });

  Decision.associate = (models) => {
    // A decision belongs to a player
    Decision.belongsTo(models.Player, {
      foreignKey: 'playerId',
      as: 'player'
    });

    // A decision belongs to a game
    Decision.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    });

    // A decision may be associated with a quest
    Decision.belongsTo(models.Quest, {
      foreignKey: 'questId',
      as: 'quest'
    });
  };

  return Decision;
};
