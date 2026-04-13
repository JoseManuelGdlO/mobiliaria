require("dotenv").config();

const shared = {
  dialect: "mysql",
  migrationStorageTableName: "sequelize_meta_forward",
};

module.exports = {
  development_main: {
    ...shared,
    host: process.env.DB_HOST || "eventivapp.cnay0qcmgf10.us-east-2.rds.amazonaws.com",
    username: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "8a4aAsQ3:WHxVDtZ]R)pJ(KYtBQ?",
    database: process.env.DB_NAME || "base",
  },
  development_dgo: {
    ...shared,
    host: process.env.DB_DGO_HOST || "eventivapp.cnay0qcmgf10.us-east-2.rds.amazonaws.com",
    username: process.env.DB_DGO_USER || "admin",
    password: process.env.DB_DGO_PASSWORD || "8a4aAsQ3:WHxVDtZ]R)pJ(KYtBQ?",
    database: process.env.DB_DGO_NAME || "dgo",
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
