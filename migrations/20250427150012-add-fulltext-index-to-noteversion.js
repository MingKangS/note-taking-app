"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex("NoteVersions", ["content"], {
      type: "FULLTEXT",
      name: "content_fulltext_index",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("NoteVersions", "content_fulltext_index");
  },
};
