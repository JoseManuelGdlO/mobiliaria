import { verifyToken } from "../libs/headers";
import express from 'express';
import jwt_decode from "jwt-decode";
const inventaryService = require('../services/inventary');
const router = express.Router();

router.get('/getInventary', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        res.status(201).json(await inventaryService.getInventary(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.delete('/removeInventary', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;

        const response = await inventaryService.removeInventary(id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.put('/updateInventary', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body;

        const response = await inventaryService.updateInventary(body)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/addInventary', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;       

        let body = req.body;

        const response = await inventaryService.addInventary(body, id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;
