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
const quotesService = require("../services/quotes");
router.post("/live", headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield quotesService.buildLiveQuote((_a = req.body) !== null && _a !== void 0 ? _a : {});
            res.status(response.code).json(response.data);
        }
        catch (err) {
            console.error("Error while building live quote", err.message);
            next(err);
        }
    });
});
module.exports = router;
