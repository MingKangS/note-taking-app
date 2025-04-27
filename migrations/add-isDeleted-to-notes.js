module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Notes", "isDeleted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Notes", "isDeleted");
  },
};
