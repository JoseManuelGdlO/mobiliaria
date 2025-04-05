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
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const clientsService = require('../services/clients');
const reportService = require('../services/reports');
const cron = require('node-cron');
const router = express_1.default.Router();
// revisa cada hora si hay algun evio por hacerse y envia una notificacion
const reviewNotifications = () => {
    reportService.runCron();
};
router.get('/clients', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            res.status(201).json(yield clientsService.getClients(id));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/getReports', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            const months = req.query.months;
            res.status(201).json(yield reportService.getReports(id, months));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
cron.schedule('1 * * * *', reviewNotifications);
module.exports = router;
