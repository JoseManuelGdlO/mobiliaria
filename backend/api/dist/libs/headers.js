"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.authorizeRoles = authorizeRoles;
const jwt = require('jsonwebtoken');
const config_1 = require("../config");
const roles_1 = require("./roles");
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
function authorizeRoles(roles) {
    return (req, res, next) => {
        var _a, _b;
        const currentRole = (0, roles_1.normalizeRole)((_b = (_a = req === null || req === void 0 ? void 0 : req.authPayload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.rol_usuario);
        if (currentRole == null || !roles.includes(currentRole)) {
            return res.status(403).json({ error: 'forbidden' });
        }
        next();
    };
}
