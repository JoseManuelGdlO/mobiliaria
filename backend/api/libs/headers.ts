
const jwt = require('jsonwebtoken');

export function verifyToken(req: any, res: any, next: any) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, 'secretkey', (err: any, authData:any) => {
            if (err) {
                res.status(409).json({error: 'token invalido'});
            } else {
                next()
            }
        });
    } else {
        res.status(409).json({error: 'token invalido'});
    }
}