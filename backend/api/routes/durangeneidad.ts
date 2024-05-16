import { verifyToken } from "../libs/headers";

const expressD = require('express');
const routerD = expressD.Router();
const jwtD = require('jsonwebtoken');
const durangeneidadService = require('../services/durangeneidad');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      // Define el directorio donde se guardarán los archivos
      cb(null, 'uploads/');
    },
    filename: function (req: any, file: any, cb: any) {
      // Define el nombre del archivo
      cb(null, file.originalname);
    }
  });

const upload = multer({ storage: storage }).fields([
    { name: 'archivo_pdf', maxCount: 1 }, // Campo para el archivo PDF
    { name: 'imagen_portada', maxCount: 1 } // Campo para la imagen
  ]);


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
        
        const response = await durangeneidadService.addArticle(body);
        
        res.status(response).json();
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
}); 

routerD.get('/getTags', async function (req: any, res: any, next: any) {
    try {

        res.status(201).json(await durangeneidadService.getTags());
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/getDetail', async function (req: any, res: any, next: any) {
    try {
        let idNumber = req.query.code
        const data = await durangeneidadService.getDetail(idNumber)
        res.status(data.code).json(data);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/getArts', async function (req: any, res: any, next: any) {
    try {
        
        let filter = req.query.filter

        res.status(201).json(await durangeneidadService.getArt(filter));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.post('/email', async function (req: any, res: any, next: any) {
    try {
        
        let body = req.body

        res.status(201).json(await durangeneidadService.email(body));
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


routerD.post('/add-book', verifyToken, upload, async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.addBook(req.body, req.files)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/books', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.getBooks(idNumber ? idNumber : null)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.put('/books', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.editBook(idNumber, req.body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.put('/article', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.editArticle(idNumber, req.body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.delete('/article', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.removeArticle(idNumber)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.delete('/books', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.removeBook(idNumber)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});



module.exports = routerD;


