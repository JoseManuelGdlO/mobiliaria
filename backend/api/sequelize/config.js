require("dotenv").config();

const shared = {
  dialect: "mysql",
  migrationStorageTableName: "sequelize_meta_forward",
};

module.exports = {
  development_main: {
    ...shared,
    host: process.env.DB_HOST || "",
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
  },
  development_dgo: {
    ...shared,
    host: process.env.DB_DGO_HOST || "",
    username: process.env.DB_DGO_USER || "",
    password: process.env.DB_DGO_PASSWORD || "",
    database: process.env.DB_DGO_NAME || "",
  },
  production_main: {
    ...shared,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  production_dgo: {
    ...shared,
    host: process.env.DB_DGO_HOST,
    username: process.env.DB_DGO_USER,
    password: process.env.DB_DGO_PASSWORD,
    database: process.env.DB_DGO_NAME,
  },
};
