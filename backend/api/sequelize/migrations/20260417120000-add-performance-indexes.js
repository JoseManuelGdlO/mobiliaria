"use strict";

/** Composite indexes for dashboard/report hot paths. Run against main DB (DB_NAME / base). */
module.exports = {
  async up(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.addIndex("evento_mob", ["id_empresa", "fecha_envio_evento"], {
      name: "idx_evento_mob_empresa_fecha_envio",
    });

    await queryInterface.addIndex("pagos_mob", ["id_evento", "id_pago"], {
      name: "idx_pagos_mob_evento_id_pago",
    });

    await queryInterface.addIndex("inventario_disponibilidad_mob", ["id_evento"], {
      name: "idx_inv_disp_mob_id_evento",
    });

    await queryInterface.addIndex("gastos_mob", ["id_empresa", "fecha", "status"], {
      name: "idx_gastos_mob_empresa_fecha_status",
    });
  },

  async down(queryInterface) {
    if (queryInterface.sequelize.config.database !== (process.env.DB_NAME || "base")) {
      return;
    }

    await queryInterface.removeIndex("evento_mob", "idx_evento_mob_empresa_fecha_envio");
    await queryInterface.removeIndex("pagos_mob", "idx_pagos_mob_evento_id_pago");
    await queryInterface.removeIndex("inventario_disponibilidad_mob", "idx_inv_disp_mob_id_evento");
    await queryInterface.removeIndex("gastos_mob", "idx_gastos_mob_empresa_fecha_status");
  },
};
