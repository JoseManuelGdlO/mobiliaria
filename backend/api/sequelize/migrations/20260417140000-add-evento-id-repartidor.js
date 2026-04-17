"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const table = "evento_mob";
    const desc = await queryInterface.describeTable(table);
    if (desc.id_repartidor) {
      return;
    }

    await queryInterface.addColumn(table, "id_repartidor", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addIndex(table, ["id_repartidor"], {
      name: "idx_evento_mob_id_repartidor",
    });

    await queryInterface.addConstraint(table, {
      fields: ["id_repartidor"],
      type: "foreign key",
      name: "evento_mob_ibfk_repartidor",
      references: {
        table: "usuarios_mobiliaria",
        field: "id_usuario",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const table = "evento_mob";
    const desc = await queryInterface.describeTable(table);
    if (!desc.id_repartidor) {
      return;
    }

    await queryInterface.removeConstraint(table, "evento_mob_ibfk_repartidor");
    await queryInterface.removeIndex(table, "idx_evento_mob_id_repartidor");
    await queryInterface.removeColumn(table, "id_repartidor");
  },
};
