/**
 * Quest Model
 * Represents a quest assigned to a player in the ChronoCore game
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quest = sequelize.define('Quest', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Ethical', 'Technical', 'Diplomatic', 'Temporal', 'General'),
      defaultValue: 'General'
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5
      }
    },
    options: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of possible quest resolution options'
    },
    selectedOption: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Index of the selected option'
    },
    outcome: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Outcome of the quest after resolution'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'failed', 'expired'),
      defaultValue: 'active'
    },
    karmaImpact: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    aiQuestId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to the quest in the AI engine'
    }
  }, {
    timestamps: true,
    tableName: 'quests',
    paranoid: true // Soft deletes
  });

  Quest.associate = (models) => {
    // A quest belongs to a player
    Quest.belongsTo(models.Player, {
      foreignKey: 'playerId',
      as: 'player'
    });
  };

  return Quest;
};
