import { Sequelize } from "sequelize";
import { config } from "../config";

const sharedOptions = {
  dialect: "mysql" as const,
  logging: false,
  pool: {
    max: Number(process.env.DB_POOL_LIMIT || 10),
    min: 0,
    idle: 10000,
  },
};

export const sequelizeMain = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    ...sharedOptions,
  }
);

export const sequelizeDurangeneidad = new Sequelize(
  config.dbDurangeneidad.database,
  config.dbDurangeneidad.user,
  config.dbDurangeneidad.password,
  {
    host: config.dbDurangeneidad.host,
    ...sharedOptions,
  }
);
