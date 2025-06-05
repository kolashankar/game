/**
 * Migration to create players table
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('players', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      gameId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role: {
        type: Sequelize.ENUM('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith'),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      karma: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      resources: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isReady: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastAction: {
        type: Sequelize.DATE,
        allowNull: true
      },
      aiPlayerId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stats: {
        type: Sequelize.JSONB,
        defaultValue: {
          questsCompleted: 0,
          decisionsCount: 0,
          realmsControlled: 0,
          timeRiftsResolved: 0
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('players');
  }
};
