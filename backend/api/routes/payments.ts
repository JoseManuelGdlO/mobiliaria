import { verifyToken } from "../libs/headers";
import express from 'express';
import jwt_decode from "jwt-decode";
const paymentsService = require('../services/payments');
const router = express.Router();

router.get('/getPayments', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);
        let id = bearer.data.id_empresa;

        res.status(201).json(await paymentsService.getPayments(id));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.put('/addPayment', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const body = req.body;
        res.status(201).json(await paymentsService.addPayment(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 


module.exports = router;