"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbDurangeneidad = exports.db = void 0;
const mysql = require('mysql2/promise');
const config_1 = require("../config");
const poolOptions = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};
const mainPool = mysql.createPool(Object.assign(Object.assign({}, config_1.config.db), poolOptions));
const durangPool = mysql.createPool(Object.assign(Object.assign({}, config_1.config.dbDurangeneidad), poolOptions));
var db;
(function (db) {
    function query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [results] = yield mainPool.execute(sql, params);
                return results;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    db.query = query;
    /** Pooled connection for transactions — always release() in finally */
    function connection() {
        return __awaiter(this, void 0, void 0, function* () {
            return mainPool.getConnection();
        });
    }
    db.connection = connection;
})(db || (exports.db = db = {}));
var dbDurangeneidad;
(function (dbDurangeneidad) {
    function query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield durangPool.execute(sql, params);
            return results;
        });
    }
    dbDurangeneidad.query = query;
    function connection() {
        return __awaiter(this, void 0, void 0, function* () {
            return durangPool.getConnection();
        });
    }
    dbDurangeneidad.connection = connection;
})(dbDurangeneidad || (exports.dbDurangeneidad = dbDurangeneidad = {}));
