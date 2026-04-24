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
const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const jwt = require('jsonwebtoken');
const config_1 = require("../config");
const headers_1 = require("../libs/headers");
function signAccessToken(data) {
    return new Promise((resolve, reject) => {
        jwt.sign({ data }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn }, (err, token) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(token);
        });
    });
}
router.post('/login', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield authService.login(req.body);
            if (response.code === 200) {
                const accessToken = yield signAccessToken(response.data);
                const refreshToken = yield authService.createRefreshSession(response.data.id_usuario);
                res.status(response.code).json({
                    data: response.data,
                    token: accessToken,
                    accessToken,
                    refreshToken,
                });
            }
            else {
                res.status(response.code).json(response);
            }
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/refresh', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield authService.rotateRefreshToken((_a = req.body) === null || _a === void 0 ? void 0 : _a.refreshToken);
            if (response.code !== 200) {
                res.status(response.code).json({ message: response.message });
                return;
            }
            const accessToken = yield signAccessToken(response.data);
            res.status(200).json({
                data: response.data,
                token: accessToken,
                accessToken,
                refreshToken: response.refreshToken,
            });
        }
        catch (err) {
            console.error(`Error while refreshing auth token`, err.message);
            next(err);
        }
    });
});
router.post('/logout', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield authService.revokeRefreshToken((_a = req.body) === null || _a === void 0 ? void 0 : _a.refreshToken);
            res.status(response.code || 200).json({ message: 'ok' });
        }
        catch (err) {
            console.error(`Error while logging out`, err.message);
            next(err);
        }
    });
});
router.post('/token', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            if (Number((_a = req.body) === null || _a === void 0 ? void 0 : _a.id) !== Number((_c = (_b = req === null || req === void 0 ? void 0 : req.authPayload) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.id_usuario)) {
                res.status(403).json({ error: 'forbidden' });
                return;
            }
            const response = yield authService.token(req.body);
            if (response.code === 200) {
                jwt.sign(response, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn }, (err, token) => {
                    res.status(response.code).json({ data: response.data, token });
                });
            }
            else {
                res.status(response.code).json(response);
            }
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/login-id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield authService.loginForId(req.body);
            res.status(201).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/register', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            res.status(201).json(yield authService.register(body));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.post('/change-account-status', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            res.status(201).json(yield authService.changeAccountStatus(body));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
router.put('/reset-password', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('req', req.body);
            const id = parseInt(req.body.id);
            res.status(201).json(yield authService.resetPassword(id));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = router;
