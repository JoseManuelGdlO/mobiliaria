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
const db_1 = require("./db");
const helper_1 = require("../helper");
function getClients(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, query = {}) {
        var _a, _b;
        const page = query.page && query.page > 0 ? query.page : 1;
        const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
        const search = ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        const offset = helper_1.helper.getOffset(page, pageSize);
        const whereClauses = ['id_empresa = ?'];
        const params = [id];
        if (search.length > 0) {
            whereClauses.push(`(
            nombre_cliente LIKE ?
            OR telefono_cliente LIKE ?
            OR correo_cliente LIKE ?
        )`);
            const searchLike = `%${search}%`;
            params.push(searchLike, searchLike, searchLike);
        }
        const whereSql = whereClauses.join(' AND ');
        const totalRows = yield db_1.db.query(`SELECT COUNT(*) as total
         FROM catalogo_clientes_mob
         WHERE ${whereSql}`, params);
        const total = Number(((_b = totalRows === null || totalRows === void 0 ? void 0 : totalRows[0]) === null || _b === void 0 ? void 0 : _b.total) || 0);
        const rows = yield db_1.db.query(`SELECT *
         FROM catalogo_clientes_mob
         WHERE ${whereSql}
         ORDER BY nombre_cliente
         LIMIT ${Math.floor(pageSize)} OFFSET ${Math.floor(offset)}`, params);
        const items = helper_1.helper.emptyOrRows(rows);
        const hasMore = offset + items.length < total;
        return {
            data: items,
            items,
            total,
            page,
            pageSize,
            hasMore,
            code: 200
        };
    });
}
module.exports = {
    getClients
};
