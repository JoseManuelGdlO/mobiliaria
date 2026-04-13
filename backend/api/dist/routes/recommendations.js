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
const recommendationsService = require("../services/recommendations");
router.post("/moodboard", headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const bearer = req.authPayload;
            const idEmpresa = Number((_a = bearer === null || bearer === void 0 ? void 0 : bearer.data) === null || _a === void 0 ? void 0 : _a.id_empresa);
            const response = yield recommendationsService.getMoodboard(idEmpresa, (_b = req.body) !== null && _b !== void 0 ? _b : {});
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error("Error while building moodboard recommendations", err.message);
            next(err);
        }
    });
});
module.exports = router;
