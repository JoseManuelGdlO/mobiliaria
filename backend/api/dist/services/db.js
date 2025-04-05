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
var db;
(function (db) {
    function query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(config_1.config.db);
                const [results,] = yield connection.execute(sql, params);
                yield connection.end();
                return results;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    db.query = query;
    function connection() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield mysql.createConnection(config_1.config.db));
        });
    }
    db.connection = connection;
})(db || (exports.db = db = {}));
var dbDurangeneidad;
(function (dbDurangeneidad) {
    function query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(config_1.config.dbDurangeneidad);
            const [results,] = yield connection.execute(sql, params);
            yield connection.end();
            return results;
        });
    }
    dbDurangeneidad.query = query;
    function connection() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield mysql.createConnection(config_1.config.dbDurangeneidad));
        });
    }
    dbDurangeneidad.connection = connection;
})(dbDurangeneidad || (exports.dbDurangeneidad = dbDurangeneidad = {}));
