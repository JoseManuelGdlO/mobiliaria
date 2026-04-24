const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const jwt = require('jsonwebtoken');
import { config } from '../config';
import { verifyToken } from '../libs/headers';

function signAccessToken(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign({ data }, config.jwtSecret, { expiresIn: config.jwtExpiresIn }, (err: any, token: any) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(token);
        });
    });
}


router.post('/login', async function (req: any, res: any, next: any) {
    try {
        const response = await authService.login(req.body)
        if (response.code === 200) {
            const accessToken = await signAccessToken(response.data);
            const refreshToken = await authService.createRefreshSession(response.data.id_usuario);
            res.status(response.code).json({
                data: response.data,
                token: accessToken,
                accessToken,
                refreshToken,
            });
        } else {
            res.status(response.code).json(response);
        }
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/refresh', async function (req: any, res: any, next: any) {
    try {
        const response = await authService.rotateRefreshToken(req.body?.refreshToken);
        if (response.code !== 200) {
            res.status(response.code).json({ message: response.message });
            return;
        }

        const accessToken = await signAccessToken(response.data);
        res.status(200).json({
            data: response.data,
            token: accessToken,
            accessToken,
            refreshToken: response.refreshToken,
        });
    } catch (err: any) {
        console.error(`Error while refreshing auth token`, err.message);
        next(err);
    }
});

router.post('/logout', async function (req: any, res: any, next: any) {
    try {
        const response = await authService.revokeRefreshToken(req.body?.refreshToken);
        res.status(response.code || 200).json({ message: 'ok' });
    } catch (err: any) {
        console.error(`Error while logging out`, err.message);
        next(err);
    }
});

router.post('/token', verifyToken, async function (req: any, res: any, next: any) {
    try {        
        if (Number(req.body?.id) !== Number(req?.authPayload?.data?.id_usuario)) {
            res.status(403).json({ error: 'forbidden' });
            return;
        }
        const response = await authService.token(req.body)
        if (response.code === 200) {
            jwt.sign(response, config.jwtSecret, { expiresIn: config.jwtExpiresIn }, (err: any, token: any) => {
                res.status(response.code).json({ data: response.data, token });
            })
        } else {
            res.status(response.code).json(response);
        }
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/login-id', async function (req: any, res: any, next: any) {
    try {
        const response = await authService.loginForId(req.body)
        res.status(201).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/register', async function (req: any, res: any, next: any) {
    try {
        let body = req.body;
        res.status(201).json(await authService.register(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/change-account-status', async function (req: any, res: any, next: any) {
    try {
        let body = req.body;
        res.status(201).json(await authService.changeAccountStatus(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.put('/reset-password', async function (req: any, res: any, next: any) {
    try {
        console.log('req', req.body);
        const id = parseInt(req.body.id);
        res.status(201).json(await authService.resetPassword(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;