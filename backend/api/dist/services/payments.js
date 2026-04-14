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
const historical_1 = require("../libs/historical");
function getPayments(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, query = {}) {
        var _a, _b, _c;
        const page = query.page && query.page > 0 ? query.page : 1;
        const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
        const search = ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        const status = ((_b = query.status) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || '';
        const offset = helper_1.helper.getOffset(page, pageSize);
        const whereClauses = ['evento_mob.id_empresa = ?'];
        const params = [id];
        if (search.length > 0) {
            whereClauses.push(`(
            evento_mob.nombre_evento LIKE ?
            OR evento_mob.nombre_titular_evento LIKE ?
            OR evento_mob.tipo_evento LIKE ?
            OR evento_mob.telefono_titular_evento LIKE ?
        )`);
            const searchLike = `%${search}%`;
            params.push(searchLike, searchLike, searchLike, searchLike);
        }
        if (status === 'paid' || status === '1') {
            whereClauses.push('evento_mob.pagado_evento = 1');
        }
        else if (status === 'pending' || status === '0') {
            whereClauses.push('evento_mob.pagado_evento = 0');
        }
        const whereSql = whereClauses.join(' AND ');
        const totalRows = yield db_1.db.query(`SELECT COUNT(*) AS total
         FROM evento_mob
         LEFT JOIN pagos_mob
           ON evento_mob.id_evento = pagos_mob.id_evento
         WHERE ${whereSql}`, params);
        const total = Number(((_c = totalRows === null || totalRows === void 0 ? void 0 : totalRows[0]) === null || _c === void 0 ? void 0 : _c.total) || 0);
        const rows = yield db_1.db.query(`SELECT *
         FROM evento_mob
         LEFT JOIN pagos_mob
           ON evento_mob.id_evento = pagos_mob.id_evento
         WHERE ${whereSql}
         ORDER BY evento_mob.fecha_envio_evento ASC
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
function addPayment(body, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const connection = yield db_1.db.connection();
        yield connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        yield connection.beginTransaction();
        try {
            const rows = yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo, fecha, abono ) VALUE
            (${body.id_evento}, ${body.total}, ${body.saldo}, ${body.anticipo}, '${new Date().toISOString().split('T')[0]}', ${body.abono})`);
            (0, historical_1.saveHistorical)(body.id_evento, idUsuario, 'Abono', body.abono);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    data,
                    code
                };
            }
            if (body.saldo === 0) {
                yield connection.execute(`UPDATE evento_mob SET pagado_evento = '1' WHERE id_evento = ${body.id_evento}`);
            }
            yield connection.commit();
            return {
                data,
                code
            };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info('Rollback successful');
            return {
                data: error,
                code: 405
            };
        }
        finally {
            connection.release();
        }
    });
}
module.exports = {
    getPayments,
    addPayment
};
