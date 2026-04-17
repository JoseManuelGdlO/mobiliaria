"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
class EventModel extends sequelize_1.Model {
}
exports.EventModel = EventModel;
EventModel.init({
    id_evento: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_evento: { type: sequelize_1.DataTypes.STRING },
    id_empresa: { type: sequelize_1.DataTypes.INTEGER },
    tipo_evento: { type: sequelize_1.DataTypes.STRING },
    fecha_envio_evento: { type: sequelize_1.DataTypes.DATEONLY },
    hora_envio_evento: { type: sequelize_1.DataTypes.STRING },
    fecha_recoleccion_evento: { type: sequelize_1.DataTypes.DATEONLY },
    hora_recoleccion_evento: { type: sequelize_1.DataTypes.STRING },
    pagado_evento: { type: sequelize_1.DataTypes.INTEGER },
    nombre_titular_evento: { type: sequelize_1.DataTypes.STRING },
    direccion_evento: { type: sequelize_1.DataTypes.STRING },
    telefono_titular_evento: { type: sequelize_1.DataTypes.STRING },
    descuento: { type: sequelize_1.DataTypes.FLOAT },
    iva: { type: sequelize_1.DataTypes.INTEGER },
    flete: { type: sequelize_1.DataTypes.FLOAT },
    lat: { type: sequelize_1.DataTypes.STRING },
    lng: { type: sequelize_1.DataTypes.STRING },
    url: { type: sequelize_1.DataTypes.STRING },
    id_creador: { type: sequelize_1.DataTypes.INTEGER },
    notificacion_envio: { type: sequelize_1.DataTypes.INTEGER },
    notificacion_recoleccion: { type: sequelize_1.DataTypes.INTEGER },
    id_repartidor: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, {
    sequelize: sequelize_2.sequelizeMain,
    tableName: "evento_mob",
    timestamps: false,
});
