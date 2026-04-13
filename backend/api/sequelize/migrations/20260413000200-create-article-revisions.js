"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_DGO_NAME || "dgo")) {
      return;
    }

    await queryInterface.createTable("article_revisions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      articulo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      editor: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      change_note: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("article_revisions", ["articulo_id"]);
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_DGO_NAME || "dgo")) {
      return;
    }

    await queryInterface.dropTable("article_revisions");
  },
};
