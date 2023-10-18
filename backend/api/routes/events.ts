import express from 'express';
import { verifyToken } from '../libs/headers';
const router = express.Router();
const eventService = require('../services/events');
import jwt_decode from "jwt-decode";


router.get('/getEvents', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode( req.headers['authorization']);
        let id = bearer.data.id_empresa;
        
        res.status(201).json(await eventService.getEvents(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.get('/getEventsDay', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        let date = req.query.date;
        res.status(201).json(await eventService.getEventsOfDay(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/available', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        let date = req.query.date;
        res.status(201).json(await eventService.availiable(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/add', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const body = req.body;
        res.status(201).json(await eventService.addEvent(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;