"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
class PaymentModel extends sequelize_1.Model {
}
exports.PaymentModel = PaymentModel;
PaymentModel.init({
    id_pago: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_evento: { type: sequelize_1.DataTypes.INTEGER },
    costo_total: { type: sequelize_1.DataTypes.FLOAT },
    saldo: { type: sequelize_1.DataTypes.FLOAT },
    anticipo: { type: sequelize_1.DataTypes.FLOAT },
}, {
    sequelize: sequelize_2.sequelizeMain,
    tableName: "pagos_mob",
    timestamps: false,
});
