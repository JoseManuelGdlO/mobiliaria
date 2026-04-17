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
const paymentsService = require('../services/payments');
const router = express_1.default.Router();
const parsePagination = (query) => {
    const rawPage = Number(query.page);
    const rawPageSize = Number(query.pageSize);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
    return { page, pageSize, search, status };
};
router.get('/getPayments', headers_1.verifyToken, (0, headers_1.authorizeRoles)(['Administrador']), function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let id = bearer.data.id_empresa;
            const { page, pageSize, search, status } = parsePagination(req.query);
            res.status(200).json(yield paymentsService.getPayments(id, { page, pageSize, search, status }));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/addPayment', headers_1.verifyToken, (0, headers_1.authorizeRoles)(['Administrador']), function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            const body = req.body;
            res.status(201).json(yield paymentsService.addPayment(body, idUsuario));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = router;
