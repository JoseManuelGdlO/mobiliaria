import { verifyToken } from "../libs/headers";
import express from 'express';
import jwt_decode from "jwt-decode";
const clientsService = require('../services/clients');
const router = express.Router();

router.get('/getClients', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        res.status(201).json(await clientsService.getClients(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;