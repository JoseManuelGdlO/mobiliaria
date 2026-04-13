"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.addColumn("inventario_mob", "ancho_cm", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "alto_cm", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "fondo_cm", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "peso_kg", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "uso_espacio", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "estilo", {
      type: Sequelize.STRING(60),
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "color", {
      type: Sequelize.STRING(60),
      allowNull: true,
    });
    await queryInterface.addColumn("inventario_mob", "material", {
      type: Sequelize.STRING(60),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.removeColumn("inventario_mob", "material");
    await queryInterface.removeColumn("inventario_mob", "color");
    await queryInterface.removeColumn("inventario_mob", "estilo");
    await queryInterface.removeColumn("inventario_mob", "uso_espacio");
    await queryInterface.removeColumn("inventario_mob", "peso_kg");
    await queryInterface.removeColumn("inventario_mob", "fondo_cm");
    await queryInterface.removeColumn("inventario_mob", "alto_cm");
    await queryInterface.removeColumn("inventario_mob", "ancho_cm");
  },
};
