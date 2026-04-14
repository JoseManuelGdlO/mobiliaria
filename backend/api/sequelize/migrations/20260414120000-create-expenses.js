"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.createTable("gastos_mob", {
      id_gasto: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      categoria: {
        type: Sequelize.ENUM("nomina", "gasolina", "varios"),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("recurrente", "ocasional"),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      periodicidad: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("activo", "cancelado"),
        allowNull: false,
        defaultValue: "activo",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("gastos_mob", ["id_empresa"]);
    await queryInterface.addIndex("gastos_mob", ["fecha"]);
    await queryInterface.addIndex("gastos_mob", ["categoria"]);
    await queryInterface.addIndex("gastos_mob", ["tipo"]);
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.dropTable("gastos_mob");
  },
};
