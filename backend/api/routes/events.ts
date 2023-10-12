import express from 'express';
const router = express.Router();
const eventService = require('../services/events');
const jwt = require('jsonwebtoken');


router.get('/getEvents', async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        res.status(201).json(await eventService.getEvents(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


router.get('/getEventsDay', async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        let date = req.query.date;
        res.status(201).json(await eventService.getEventsOfDay(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/available', async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        let date = req.query.date;
        res.status(201).json(await eventService.availiable(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/add', async function (req: any, res: any, next: any) {
    try {
        const body = req.body;
        res.status(201).json(await eventService.addEvent(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;