"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jwt = require('jsonwebtoken');
const config_1 = require("../config");
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, config_1.config.jwtSecret, (err, authData) => {
            if (err) {
                res.status(409).json({ error: 'token invalido' });
            }
            else {
                req.authPayload = authData;
                next();
            }
        });
    }
    else {
        res.status(409).json({ error: 'token invalido' });
    }
}
