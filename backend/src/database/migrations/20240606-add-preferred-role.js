'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'preferredRole', {
      type: Sequelize.ENUM('time_traveler', 'guardian', 'observer'),
      allowNull: true,
      defaultValue: 'time_traveler'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'preferredRole');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_preferredRole";');
  }
};
