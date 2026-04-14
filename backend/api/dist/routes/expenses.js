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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const headers_1 = require("../libs/headers");
const express_1 = __importDefault(require("express"));
const expensesService = require('../services/expenses');
const router = express_1.default.Router();
const parsePagination = (query) => {
    const rawPage = Number(query.page);
    const rawPageSize = Number(query.pageSize);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
    const category = typeof query.category === 'string' ? query.category.trim().toLowerCase() : '';
    const type = typeof query.type === 'string' ? query.type.trim().toLowerCase() : '';
    const from = typeof query.from === 'string' ? query.from.trim() : '';
    const to = typeof query.to === 'string' ? query.to.trim() : '';
    return { page, pageSize, search, status, category, type, from, to };
};
router.get('/getExpenses', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            const idEmpresa = bearer.data.id_empresa;
            const { page, pageSize, search, status, category, type, from, to } = parsePagination(req.query);
            res.status(200).json(yield expensesService.getExpenses(idEmpresa, { page, pageSize, search, status, category, type, from, to }));
        }
        catch (err) {
            console.error(`Error while getting expenses`, err.message);
            next(err);
        }
    });
});
router.put('/addExpense', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            const idUsuario = bearer.data.id_usuario;
            const idEmpresa = bearer.data.id_empresa;
            const body = Object.assign(Object.assign({}, req.body), { id_empresa: idEmpresa });
            const response = yield expensesService.addExpense(body, idUsuario, 'ocasional');
            res.status(response.code || 200).json(response);
        }
        catch (err) {
            console.error(`Error while adding expense`, err.message);
            next(err);
        }
    });
});
router.put('/addRecurringExpense', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            const idUsuario = bearer.data.id_usuario;
            const idEmpresa = bearer.data.id_empresa;
            const body = Object.assign(Object.assign({}, req.body), { id_empresa: idEmpresa });
            const response = yield expensesService.addExpense(body, idUsuario, 'recurrente');
            res.status(response.code || 200).json(response);
        }
        catch (err) {
            console.error(`Error while adding recurring expense`, err.message);
            next(err);
        }
    });
});
router.put('/editExpense', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            const idUsuario = bearer.data.id_usuario;
            const idEmpresa = bearer.data.id_empresa;
            const response = yield expensesService.editExpense(Object.assign(Object.assign({}, req.body), { id_empresa: idEmpresa }), idUsuario);
            res.status(response.code || 200).json(response);
        }
        catch (err) {
            console.error(`Error while editing expense`, err.message);
            next(err);
        }
    });
});
router.delete('/removeExpense', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            const idUsuario = bearer.data.id_usuario;
            const idEmpresa = bearer.data.id_empresa;
            const idGasto = Number(req.query.id_gasto);
            const response = yield expensesService.removeExpense(idGasto, idEmpresa, idUsuario);
            res.status(response.code || 200).json(response);
        }
        catch (err) {
            console.error(`Error while removing expense`, err.message);
            next(err);
        }
    });
});
module.exports = router;
