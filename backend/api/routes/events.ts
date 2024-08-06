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
        let idUsuario = bearer.data.id_usuario;
        const response = await eventService.addEvent(body, id, idUsuario)
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
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;
        const response = await eventService.changeStatus(id, delivered, recolected, idUsuario);
        res.status(response.code).json(response.data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});
router.put('/ubication', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;
        let id = req.query.id
        let body = req.body
        console.log('body', body, 'id', id);
        
        const response = await eventService.addUrltoEvent(body, id, idUsuario);
        res.status(response).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});
router.put('/flete', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;
        let id = req.query.id
        let body = req.body
        const response = await eventService.addFlete(body, id, idUsuario);
        res.status(response).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.post('/additems', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;
        
        const response = await eventService.addItems(body, idUsuario);
        
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.post('/edit', verifyToken, async function (req: any, res: any, next: any) {
    try {
        
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;
        let body = req.body
        
        const response = await eventService.editEvent(body, idUsuario);
        
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.delete('/remove', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id
        console.log('id', id);
        

        const response = await eventService.remove(id);
        res.status(response).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

router.delete('/removeitem', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let id = req.query.id
        const id_mob = req.query.id_mob
        const bearer: any = jwt_decode(req.headers['authorization']);
        let idUsuario = bearer.data.id_usuario;

        const response = await eventService.removeItem(id, id_mob, idUsuario);
        
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/not', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let message = req.query.message
        const title = req.query.title
        const idCompany = req.query.idCompany
        const id = req.query.idUsuario

        const response = await eventService.sendNotification(message, title, idCompany, id);
        
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;