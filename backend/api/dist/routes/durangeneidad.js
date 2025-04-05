"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const headers_1 = require("../libs/headers");
const expressD = require('express');
const routerD = expressD.Router();
const jwtD = require('jsonwebtoken');
const durangeneidadService = require('../services/durangeneidad');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define el directorio donde se guardarán los archivos
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Define el nombre del archivo
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage }).fields([
    { name: 'archivo_pdf', maxCount: 1 }, // Campo para el archivo PDF
    { name: 'imagen_portada', maxCount: 1 } // Campo para la imagen
]);
routerD.post('/login', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.login(req.body);
            if (response.code === 200) {
                jwtD.sign(response, 'secretkey', (err, token) => {
                    res.status(response.code).json({ data: response.data, token });
                });
            }
            else {
                res.status(response.code).json(response);
            }
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/add', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            const response = yield durangeneidadService.addArticle(body);
            res.status(response).json();
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/getTags', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.status(201).json(yield durangeneidadService.getTags());
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/getDetail', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let idNumber = req.query.code;
            const data = yield durangeneidadService.getDetail(idNumber);
            res.status(data.code).json(data);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/getArts', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let filter = req.query.filter;
            let type = req.query.type;
            res.status(201).json(yield durangeneidadService.getArt(filter, type));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/email', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.body;
            res.status(201).json(yield durangeneidadService.email(body));
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/add-book', headers_1.verifyToken, upload, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.addBook(req.body, req.files);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/books', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.getBooks(idNumber ? idNumber : null);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.put('/books', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.editBook(idNumber, req.body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.put('/article', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.editArticle(idNumber, req.body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.delete('/article', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.removeArticle(idNumber);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.delete('/books', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.removeBook(idNumber);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/avisos', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.addAdvice(req.body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/avisos', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.getAdvice(idNumber ? idNumber : null);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/configuraciones', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.createConfiguration(req.body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
const uploadConf = multer({ storage: storage }).fields([
    { name: 'imagen', maxCount: 1 } // Campo para la imagen
]);
routerD.post('/configuracionesImagen', headers_1.verifyToken, uploadConf, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.createConfigurationImage(req.body, req.files);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/configuraciones', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idNumber = req.query.id;
            const response = yield durangeneidadService.getConfiguration(idNumber ? idNumber : null);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/categories', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.getCategories();
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.post('/categories', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const response = yield durangeneidadService.addCategory(body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.put('/categories', headers_1.verifyToken, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const response = yield durangeneidadService.updateCategory(body);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
routerD.get('/biografia', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.getBio();
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
const uploadBio = multer({ storage: storage }).fields([
    { name: 'imagen_perfil', maxCount: 1 } // Campo para la imagen
]);
routerD.put('/biografia', headers_1.verifyToken, uploadBio, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield durangeneidadService.uploadBio(req.body, req.files);
            res.status(response.code).json(response);
        }
        catch (err) {
            console.error(`Error while getting enarm students info `, err.message);
            next(err);
        }
    });
});
module.exports = routerD;
