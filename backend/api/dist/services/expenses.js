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
const allowedCategories = ['nomina', 'gasolina', 'varios'];
const allowedTypes = ['recurrente', 'ocasional'];
const allowedStatuses = ['activo', 'cancelado'];
const normalizeDate = (raw) => {
    if (typeof raw !== 'string')
        return '';
    const value = raw.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return '';
    return value;
};
function getExpenses(idEmpresa_1) {
    return __awaiter(this, arguments, void 0, function* (idEmpresa, query = {}) {
        var _a, _b, _c, _d, _e;
        const page = query.page && query.page > 0 ? query.page : 1;
        const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
        const search = ((_a = query.search) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        const status = ((_b = query.status) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || '';
        const category = ((_c = query.category) === null || _c === void 0 ? void 0 : _c.trim().toLowerCase()) || '';
        const type = ((_d = query.type) === null || _d === void 0 ? void 0 : _d.trim().toLowerCase()) || '';
        const from = normalizeDate(query.from);
        const to = normalizeDate(query.to);
        const offset = helper_1.helper.getOffset(page, pageSize);
        const whereClauses = ['id_empresa = ?'];
        const params = [idEmpresa];
        if (search.length > 0) {
            whereClauses.push(`(
      descripcion LIKE ?
      OR categoria LIKE ?
      OR tipo LIKE ?
    )`);
            const searchLike = `%${search}%`;
            params.push(searchLike, searchLike, searchLike);
        }
        if (allowedCategories.includes(category)) {
            whereClauses.push('categoria = ?');
            params.push(category);
        }
        if (allowedTypes.includes(type)) {
            whereClauses.push('tipo = ?');
            params.push(type);
        }
        if (allowedStatuses.includes(status)) {
            whereClauses.push('status = ?');
            params.push(status);
        }
        if (from) {
            whereClauses.push('fecha >= ?');
            params.push(from);
        }
        if (to) {
            whereClauses.push('fecha <= ?');
            params.push(to);
        }
        const whereSql = whereClauses.join(' AND ');
        const totalRows = yield db_1.db.query(`SELECT COUNT(*) AS total FROM gastos_mob WHERE ${whereSql}`, params);
        const total = Number(((_e = totalRows === null || totalRows === void 0 ? void 0 : totalRows[0]) === null || _e === void 0 ? void 0 : _e.total) || 0);
        const rows = yield db_1.db.query(`SELECT *
     FROM gastos_mob
     WHERE ${whereSql}
     ORDER BY fecha DESC, id_gasto DESC
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
            code: 200,
        };
    });
}
function addExpense(body, idUsuario, forceType) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const categoria = String((body === null || body === void 0 ? void 0 : body.categoria) || '').trim().toLowerCase();
        const tipoFromBody = String((body === null || body === void 0 ? void 0 : body.tipo) || '').trim().toLowerCase();
        const tipo = forceType || tipoFromBody || 'ocasional';
        const status = String((body === null || body === void 0 ? void 0 : body.status) || 'activo').trim().toLowerCase();
        const descripcion = String((body === null || body === void 0 ? void 0 : body.descripcion) || '').trim();
        const periodicidad = (body === null || body === void 0 ? void 0 : body.periodicidad) != null ? String(body.periodicidad).trim().toLowerCase() : null;
        const monto = Number((_a = body === null || body === void 0 ? void 0 : body.monto) !== null && _a !== void 0 ? _a : 0);
        const fecha = normalizeDate(String((body === null || body === void 0 ? void 0 : body.fecha) || '')) || new Date().toISOString().split('T')[0];
        const idEmpresa = Number((_b = body === null || body === void 0 ? void 0 : body.id_empresa) !== null && _b !== void 0 ? _b : 0);
        if (!allowedCategories.includes(categoria)) {
            return { data: 'Categoria invalida', code: 400 };
        }
        if (!allowedTypes.includes(tipo)) {
            return { data: 'Tipo invalido', code: 400 };
        }
        if (!allowedStatuses.includes(status)) {
            return { data: 'Status invalido', code: 400 };
        }
        if (!Number.isFinite(monto) || monto <= 0) {
            return { data: 'Monto invalido', code: 400 };
        }
        if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
            return { data: 'Empresa invalida', code: 400 };
        }
        if (tipo === 'recurrente' && !periodicidad) {
            return { data: 'Periodicidad requerida para gastos recurrentes', code: 400 };
        }
        try {
            const result = yield db_1.db.query(`INSERT INTO gastos_mob
      (id_empresa, id_usuario, categoria, tipo, monto, fecha, descripcion, periodicidad, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [idEmpresa, idUsuario, categoria, tipo, monto, fecha, descripcion, periodicidad, status]);
            return {
                data: {
                    id_gasto: result === null || result === void 0 ? void 0 : result.insertId,
                },
                code: 201,
            };
        }
        catch (error) {
            console.error(error);
            return { data: error, code: 405 };
        }
    });
}
function editExpense(body, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const idGasto = Number((_a = body === null || body === void 0 ? void 0 : body.id_gasto) !== null && _a !== void 0 ? _a : 0);
        const idEmpresa = Number((_b = body === null || body === void 0 ? void 0 : body.id_empresa) !== null && _b !== void 0 ? _b : 0);
        if (!Number.isFinite(idGasto) || idGasto <= 0) {
            return { data: 'ID de gasto invalido', code: 400 };
        }
        if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
            return { data: 'Empresa invalida', code: 400 };
        }
        const updates = ['id_usuario = ?'];
        const params = [idUsuario];
        if (body.categoria != null) {
            const categoria = String(body.categoria).trim().toLowerCase();
            if (!allowedCategories.includes(categoria))
                return { data: 'Categoria invalida', code: 400 };
            updates.push('categoria = ?');
            params.push(categoria);
        }
        if (body.tipo != null) {
            const tipo = String(body.tipo).trim().toLowerCase();
            if (!allowedTypes.includes(tipo))
                return { data: 'Tipo invalido', code: 400 };
            updates.push('tipo = ?');
            params.push(tipo);
        }
        if (body.status != null) {
            const status = String(body.status).trim().toLowerCase();
            if (!allowedStatuses.includes(status))
                return { data: 'Status invalido', code: 400 };
            updates.push('status = ?');
            params.push(status);
        }
        if (body.monto != null) {
            const monto = Number(body.monto);
            if (!Number.isFinite(monto) || monto <= 0)
                return { data: 'Monto invalido', code: 400 };
            updates.push('monto = ?');
            params.push(monto);
        }
        if (body.fecha != null) {
            const fecha = normalizeDate(String(body.fecha));
            if (!fecha)
                return { data: 'Fecha invalida', code: 400 };
            updates.push('fecha = ?');
            params.push(fecha);
        }
        if (body.descripcion != null) {
            updates.push('descripcion = ?');
            params.push(String(body.descripcion).trim());
        }
        if (body.periodicidad !== undefined) {
            const periodicidad = body.periodicidad == null ? null : String(body.periodicidad).trim().toLowerCase();
            updates.push('periodicidad = ?');
            params.push(periodicidad);
        }
        updates.push('updated_at = NOW()');
        params.push(idGasto, idEmpresa);
        try {
            const result = yield db_1.db.query(`UPDATE gastos_mob SET ${updates.join(', ')} WHERE id_gasto = ? AND id_empresa = ?`, params);
            return {
                data: {
                    affectedRows: Number((result === null || result === void 0 ? void 0 : result.affectedRows) || 0),
                },
                code: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { data: error, code: 405 };
        }
    });
}
function removeExpense(idGasto, idEmpresa, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Number.isFinite(idGasto) || idGasto <= 0) {
            return { data: 'ID de gasto invalido', code: 400 };
        }
        if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
            return { data: 'Empresa invalida', code: 400 };
        }
        try {
            const result = yield db_1.db.query(`UPDATE gastos_mob
       SET status = 'cancelado', id_usuario = ?, updated_at = NOW()
       WHERE id_gasto = ? AND id_empresa = ?`, [idUsuario, idGasto, idEmpresa]);
            return {
                data: {
                    affectedRows: Number((result === null || result === void 0 ? void 0 : result.affectedRows) || 0),
                },
                code: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { data: error, code: 405 };
        }
    });
}
module.exports = {
    getExpenses,
    addExpense,
    editExpense,
    removeExpense,
};
