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
        let type = req.query.type

        res.status(201).json(await durangeneidadService.getArt(filter, type));
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

routerD.post('/avisos', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.addAdvice(req.body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/avisos', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.getAdvice(idNumber ? idNumber : null)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.post('/configuraciones', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.createConfiguration(req.body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

const uploadConf = multer({ storage: storage }).fields([
    { name: 'imagen', maxCount: 1 } // Campo para la imagen
  ]);
routerD.post('/configuracionesImagen', verifyToken, uploadConf, async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.createConfigurationImage(req.body, req.files)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.get('/configuraciones', async function (req: any, res: any, next: any) {
    try {
        const idNumber = req.query.id 
        const response = await durangeneidadService.getConfiguration(idNumber ? idNumber : null)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});


routerD.get('/categories', async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.getCategories()
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});



routerD.post('/categories', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const body = req.body
        const response = await durangeneidadService.addCategory(body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

routerD.put('/categories', verifyToken, async function (req: any, res: any, next: any) {
    try {
        const body = req.body
        const response = await durangeneidadService.updateCategory(body)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});



routerD.get('/biografia', async function (req: any, res: any, next: any) {
    try {
        const response = await durangeneidadService.getBio()
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});

const uploadBio = multer({ storage: storage }).fields([
    { name: 'imagen_perfil', maxCount: 1 } // Campo para la imagen
  ]);

routerD.put('/biografia', verifyToken, uploadBio, async function (req: any, res: any, next: any) {
    try {
        
        const response = await durangeneidadService.uploadBio(req.body, req.files)
        res.status(response.code).json(response);
    } catch (err: any) {
        console.error(`Error while getting enarm students info `, err.message);
        next(err);
    }
});



module.exports = routerD;


