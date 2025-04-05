"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            if (err) {
                res.status(409).json({ error: 'token invalido' });
            }
            else {
                next();
            }
        });
    }
    else {
        res.status(409).json({ error: 'token invalido' });
    }
}
