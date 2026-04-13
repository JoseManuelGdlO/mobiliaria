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
const express_1 = __importDefault(require("express"));
const headers_1 = require("../libs/headers");
const router = express_1.default.Router();
const eventService = require('../services/events');
const notifications_1 = require("../libs/notifications");
router.get('/getEvents', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let id = bearer.data.id_empresa;
            res.status(201).json(yield eventService.getEvents(id));
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
            const bearer = req.authPayload;
            let id = bearer.data.id_empresa;
            let date = req.query.date;
            res.status(201).json(yield eventService.getEventsOfDay(id, date));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/getDetail', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            res.status(201).json(yield eventService.getDetails(id));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/available', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let id = bearer.data.id_empresa;
            let date = req.query.date;
            res.status(201).json(yield eventService.availiable(id, date));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/add', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const bearer = req.authPayload;
            let id = bearer.data.id_empresa;
            let idUsuario = bearer.data.id_usuario;
            const response = yield eventService.addEvent(body, id, idUsuario);
            res.status(response).json();
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/observaciones', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            res.status(201).json(yield eventService.updateObvs(body));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/status', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            let delivered = req.query.delivered;
            let recolected = req.query.recolected;
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            const response = yield eventService.changeStatus(id, delivered, recolected, idUsuario);
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/ubication', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            let id = req.query.id;
            let body = req.body;
            console.log('body', body, 'id', id);
            const response = yield eventService.addUrltoEvent(body, id, idUsuario);
            res.status(response).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/flete', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            let id = req.query.id;
            let body = req.body;
            const response = yield eventService.addFlete(body, id, idUsuario);
            res.status(response).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/:id/design-draft', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const bearer = req.authPayload;
            const idUsuario = Number((_a = bearer === null || bearer === void 0 ? void 0 : bearer.data) === null || _a === void 0 ? void 0 : _a.id_usuario);
            const idEmpresa = Number((_b = bearer === null || bearer === void 0 ? void 0 : bearer.data) === null || _b === void 0 ? void 0 : _b.id_empresa);
            const idEvent = Number(req.params.id);
            const response = yield eventService.saveDesignDraft(idEvent, idEmpresa, idUsuario, (_c = req.body) !== null && _c !== void 0 ? _c : {});
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error(`Error while saving event draft`, err.message);
            next(err);
        }
    });
});
router.post('/additems', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            const response = yield eventService.addItems(body, idUsuario);
            res.status(response).json();
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/edit', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            let body = req.body;
            const response = yield eventService.editEvent(body, idUsuario);
            res.status(response.code).json(response);
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
            console.log('id', id);
            const response = yield eventService.remove(id);
            res.status(response).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.delete('/removeitem', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let id = req.query.id;
            const id_mob = req.query.id_mob;
            const bearer = req.authPayload;
            let idUsuario = bearer.data.id_usuario;
            const response = yield eventService.removeItem(id, id_mob, idUsuario);
            res.status(response).json();
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.get('/not', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = req.query.message;
            const title = req.query.title;
            const idCompany = req.query.idCompany;
            const id = req.query.idUsuario;
            const access_token = yield (0, notifications_1.getAccessToken)();
            const response = yield eventService.sendNotification(message, title, idCompany, id, access_token);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = router;
