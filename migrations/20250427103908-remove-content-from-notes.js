module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("Notes");
    if (tableDescription.content) {
      await queryInterface.removeColumn("Notes", "content");
    }
  },

  down: async (queryInterface, Sequelize) => {},
};
