"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const tableName = "auth_refresh_tokens";
    const table = await queryInterface.describeTable(tableName).catch(() => null);
    if (table) {
      return;
    }

    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      token_hash: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      replaced_by: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(tableName, ["token_hash"], {
      unique: true,
      name: "uq_auth_refresh_tokens_hash",
    });
    await queryInterface.addIndex(tableName, ["id_usuario"], {
      name: "idx_auth_refresh_tokens_user",
    });
    await queryInterface.addIndex(tableName, ["expires_at"], {
      name: "idx_auth_refresh_tokens_expires",
    });
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    const tableName = "auth_refresh_tokens";
    const table = await queryInterface.describeTable(tableName).catch(() => null);
    if (!table) {
      return;
    }

    await queryInterface.dropTable(tableName);
  },
};
