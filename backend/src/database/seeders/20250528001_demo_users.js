/**
 * Seeder for demo users
 */

'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    
    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@chronocore.com',
        password: adminPassword,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
        bio: 'ChronoCore game administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        username: 'player1',
        email: 'player1@example.com',
        password: userPassword,
        avatar: 'https://ui-avatars.com/api/?name=Player1&background=2E8B57&color=fff',
        bio: 'Eager time traveler',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        username: 'player2',
        email: 'player2@example.com',
        password: userPassword,
        avatar: 'https://ui-avatars.com/api/?name=Player2&background=8B0000&color=fff',
        bio: 'Master of timelines',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
