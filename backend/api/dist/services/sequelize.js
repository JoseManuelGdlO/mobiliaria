"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelizeDurangeneidad = exports.sequelizeMain = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
const sharedOptions = {
    dialect: "mysql",
    logging: false,
    pool: {
        max: Number(process.env.DB_POOL_LIMIT || 10),
        min: 0,
        idle: 10000,
    },
};
exports.sequelizeMain = new sequelize_1.Sequelize(config_1.config.db.database, config_1.config.db.user, config_1.config.db.password, Object.assign({ host: config_1.config.db.host }, sharedOptions));
exports.sequelizeDurangeneidad = new sequelize_1.Sequelize(config_1.config.dbDurangeneidad.database, config_1.config.dbDurangeneidad.user, config_1.config.dbDurangeneidad.password, Object.assign({ host: config_1.config.dbDurangeneidad.host }, sharedOptions));
