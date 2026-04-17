import { authorizeRoles, verifyToken } from "../libs/headers";
import express from 'express';
const paymentsService = require('../services/payments');
const router = express.Router();

const parsePagination = (query: any) => {
    const rawPage = Number(query.page);
    const rawPageSize = Number(query.pageSize);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';

    return { page, pageSize, search, status };
};

router.get('/getPayments', verifyToken, authorizeRoles(['Administrador']), async function (req: any, res: any, next: any) {
    try {
        const bearer: any = req.authPayload;
        let id = bearer.data.id_empresa;
        const { page, pageSize, search, status } = parsePagination(req.query);

        res.status(200).json(await paymentsService.getPayments(id, { page, pageSize, search, status }));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

router.put('/addPayment', verifyToken, authorizeRoles(['Administrador']), async function (req: any, res: any, next: any) {
    try {
        const bearer: any = req.authPayload;
        let idUsuario = bearer.data.id_usuario;
        const body = req.body;
        res.status(201).json(await paymentsService.addPayment(body, idUsuario));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 


module.exports = router;