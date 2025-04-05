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
const inventaryService = require('../services/inventary');
const router = express_1.default.Router();
router.get('/getInventary', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            res.status(201).json(yield inventaryService.getInventary(id));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.delete('/removeInventary', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            const response = yield inventaryService.removeInventary(id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/updateInventary', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            const response = yield inventaryService.updateInventary(body);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/getPackages', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            const response = yield inventaryService.getPackages(id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/addInventary', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            let body = req.body;
            const response = yield inventaryService.addInventary(body, id);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/addPackages', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = (0, jwt_decode_1.default)(req.headers['authorization']);
            let id = bearer.data.id_empresa;
            let body = req.body;
            const response = yield inventaryService.addPackage(id, body);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.delete('/removePackage', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            let body = req.body;
            const response = yield inventaryService.removePackage(id, body);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = router;
