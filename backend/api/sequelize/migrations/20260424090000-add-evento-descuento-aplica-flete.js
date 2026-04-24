"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const table = "evento_mob";
    const desc = await queryInterface.describeTable(table);
    if (desc.descuento_aplica_flete) {
      return;
    }

    await queryInterface.addColumn(table, "descuento_aplica_flete", {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const table = "evento_mob";
    const desc = await queryInterface.describeTable(table);
    if (!desc.descuento_aplica_flete) {
      return;
    }

    await queryInterface.removeColumn(table, "descuento_aplica_flete");
  },
};
