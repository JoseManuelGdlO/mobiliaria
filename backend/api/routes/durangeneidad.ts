import { verifyToken } from "../libs/headers";

const expressD = require('express');
const routerD = expressD.Router();
const jwtD = require('jsonwebtoken');
const durangeneidadService = require('../services/durangeneidad');


routerD.post('/login', async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.login(req.body)
        if (response.code === 200) {
            jwtD.sign( response, 'secretkey', (err: any, token: any) => {
                res.status(response.code).json({ data: response.data, token });
            })
        } else {
            res.status(response.code).json(response);
        }
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.post('/add', verifyToken, async function (req: any, res: any, next: any) {
    try {
        let body = req.body
        console.log(body);
        
        const response = await durangeneidadService.addArticle(body);
        
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

routerD.get('/getTags', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const bearer: any = jwt_decode(req.headers['authorization']);

        res.status(201).json(await durangeneidadService.getTags());
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/getArts', verifyToken, async function (req: any, res: any, next: any) {
    try {
        
        let filter = req.query.filter

        res.status(201).json(await durangeneidadService.getArt(filter));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


module.exports = routerD;

function jwt_decode(arg0: any): any {
    throw new Error("Function not implemented.");
}
