import { verifyToken } from "../libs/headers";
import express from 'express';
import jwt_decode from "jwt-decode";
const workersService = require('../services/workers');
const router = express.Router();

router.get('/getWorkers', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        res.status(201).json(await workersService.getWorkers(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;