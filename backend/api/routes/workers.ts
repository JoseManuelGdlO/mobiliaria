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

router.get('/getEventsDay', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        let date = req.query.date;

        res.status(201).json(await workersService.getEventsDay(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.post('/addWorker', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        let body = req.body;
        const response = await workersService.addWorker(body, id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.put('/editWorker', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body;
        const response = await workersService.editWorker(body)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.delete('/remove', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        const response = await workersService.remove(id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.put('/active', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        let type = req.query.type;
        const response = await workersService.active(type, id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/gen', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        const response = await workersService.generePass(id)
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;
