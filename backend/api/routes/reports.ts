import { verifyToken } from "../libs/headers";
import express from 'express';
import jwt_decode from "jwt-decode";
const clientsService = require('../services/clients');
const reportService = require('../services/reports');
const cron = require('node-cron')
const router = express.Router();


// revisa cada hora si hay algun evio por hacerse y envia una notificacion
const reviewNotifications = () => {
    reportService.runCron()
}

router.get('/clients', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        res.status(201).json(await clientsService.getClients(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/getReports', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        const months = req.query.months;

        res.status(201).json(await reportService.getReports(id, months));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

cron.schedule('*/1 * * * *', reviewNotifications)

module.exports = router;