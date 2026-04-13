
const jwt = require('jsonwebtoken');
import { config } from "../config";

export function verifyToken(req: any, res: any, next: any) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, config.jwtSecret, (err: any, authData: any) => {
            if (err) {
                res.status(409).json({error: 'token invalido'});
            } else {
                req.authPayload = authData;
                next();
            }
        });
    } else {
        res.status(409).json({error: 'token invalido'});
    }
}