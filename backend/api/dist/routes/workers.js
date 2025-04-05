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
const workersService = require('../services/workers');
const router = express_1.default.Router();
router.get('/getWorkers', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            res.status(201).json(yield workersService.getWorkers(id));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/getEventsDay', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            let date = req.query.date;
            res.status(201).json(yield workersService.getEventsDay(id, date));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/addWorker', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            let body = req.body;
            const response = yield workersService.addWorker(body, id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/editWorker', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            const response = yield workersService.editWorker(body);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.delete('/remove', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            const response = yield workersService.remove(id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/active', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            let type = req.query.type;
            const response = yield workersService.active(type, id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/gen', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            const response = yield workersService.generePass(id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = router;
