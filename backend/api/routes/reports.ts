import { authorizeRoles, verifyToken } from "../libs/headers";
import express from 'express';
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
        const bearer: any = req.authPayload;
        let id = bearer.data.id_empresa;

        res.status(201).json(await clientsService.getClients(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/getReports', verifyToken, authorizeRoles(['Administrador']), async function (req: any, res: any, next: any) {
    try {
        const bearer: any = req.authPayload;
        let id = bearer.data.id_empresa;

        const months = req.query.months;

        res.status(201).json(await reportService.getReports(id, months));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.get('/getFinancialSummary', verifyToken, authorizeRoles(['Administrador']), async function (req: any, res: any, next: any) {
    try {
        const bearer: any = req.authPayload;
        let id = bearer.data.id_empresa;
        const months = req.query.months;
        const period = req.query.period;
        const month = req.query.month;
        const year = req.query.year;
        const compareMonth = req.query.compareMonth;
        const compareYear = req.query.compareYear;

        const response = await reportService.getFinancialSummary(id, months, period, month, year, compareMonth, compareYear);
        res.status(response.code || 200).json(response);
    } catch (err: any) {
        console.error(`Error while getting financial summary`, err.message);
        next(err);
    }
});

cron.schedule('1 * * * *', reviewNotifications)

module.exports = router;