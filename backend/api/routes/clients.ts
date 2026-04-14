import { verifyToken } from "../libs/headers";
import express from 'express';
const clientsService = require('../services/clients');
const router = express.Router();

const parsePagination = (query: any) => {
    const rawPage = Number(query.page);
    const rawPageSize = Number(query.pageSize);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
    const search = typeof query.search === 'string' ? query.search.trim() : '';

    return { page, pageSize, search };
};

router.get('/getClients', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = req.authPayload;
        let id = bearer.data.id_empresa;
        const { page, pageSize, search } = parsePagination(req.query);

        res.status(200).json(await clientsService.getClients(id, { page, pageSize, search }));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

module.exports = router;