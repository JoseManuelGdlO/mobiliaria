"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAvailabilityModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
class InventoryAvailabilityModel extends sequelize_1.Model {
}
exports.InventoryAvailabilityModel = InventoryAvailabilityModel;
InventoryAvailabilityModel.init({
    id_fecha: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha_evento: { type: sequelize_1.DataTypes.DATEONLY },
    hora_evento: { type: sequelize_1.DataTypes.STRING },
    id_mob: { type: sequelize_1.DataTypes.INTEGER },
    ocupados: { type: sequelize_1.DataTypes.INTEGER },
    id_evento: { type: sequelize_1.DataTypes.INTEGER },
    hora_recoleccion: { type: sequelize_1.DataTypes.STRING },
    costo: { type: sequelize_1.DataTypes.FLOAT },
    package: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, {
    sequelize: sequelize_2.sequelizeMain,
    tableName: "inventario_disponibilidad_mob",
    timestamps: false,
});
