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
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;
        let date = req.query.date;
        res.status(201).json(await eventService.getEventsOfDay(id, date));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/getDetail', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id;
        res.status(201).json(await eventService.getDetails(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/available', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

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
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;
        const response = await eventService.addEvent(body, id)
        console.log('here7', response);
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.put('/observaciones', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body
        res.status(201).json(await eventService.updateObvs(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.put('/status', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id
        let delivered = req.query.delivered
        let recolected = req.query.recolected
        const response = await eventService.changeStatus(id, delivered, recolected);
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/additems', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body
        console.log(body);
        
        const response = await eventService.addItems(body);
        res.status(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.delete('/remove', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id

        const response = await eventService.remove(id);
        res.status(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.delete('/removeitem', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id
        const id_mob = req.query.id_mob

        const response = await eventService.removeItem(id, id_mob);
        
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;