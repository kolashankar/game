/**
 * Migration to create games table
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      joinCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('created', 'active', 'paused', 'completed'),
        defaultValue: 'created'
      },
      maxPlayers: {
        type: Sequelize.INTEGER,
        defaultValue: 6
      },
      currentEra: {
        type: Sequelize.ENUM('Initiation', 'Progression', 'Distortion', 'Equilibrium'),
        defaultValue: 'Initiation'
      },
      currentTurn: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      currentPlayerIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      globalKarma: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      creatorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      aiGameStateId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('games');
  }
};
