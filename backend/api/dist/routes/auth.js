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
const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const jwt = require('jsonwebtoken');
router.post('/login', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield authService.login(req.body);
            if (response.code === 200) {
                jwt.sign(response, 'secretkey', (err, token) => {
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
router.post('/token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield authService.token(req.body);
            if (response.code === 200) {
                jwt.sign(response, 'secretkey', (err, token) => {
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
