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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const helper_1 = require("../helper");
const fts_service_1 = require("../libs/fts-service");
const path_1 = __importDefault(require("path"));
const nodemailer = require("nodemailer");
function login(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM usuarios
      WHERE email = "${body.email}" AND contrasena = "${body.password}"`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        data = data[0];
        return {
            data,
            code,
        };
    });
}
function getTags() {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM tags`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        return {
            data,
            code,
        };
    });
}
function getArt(filter, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        let query = "";
        if (type === "ALL") {
            query = "SELECT * FROM articulo";
        }
        else if (type === "TAGS") {
            query = `SELECT *
    FROM articulo
    WHERE id IN (
        SELECT fkid_articulo
        FROM tags
        WHERE label = '${filter}'
    );`;
        }
        else if (type === "CATEGORY") {
            query = `SELECT *
    FROM articulo
    WHERE fkid_category = ${filter};`;
        }
        const rows = yield db_1.dbDurangeneidad.query(query);
        const tags = yield db_1.dbDurangeneidad.query(`SELECT label, COUNT(*) AS count
  FROM tags
  GROUP BY label;`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        return {
            data,
            tags: helper_1.helper.emptyOrRows(tags),
            code,
        };
    });
}
function getDetail(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM articulo
        WHERE id = ${id}`);
            const tags = yield db_1.dbDurangeneidad.query(`SELECT * FROM tags
        WHERE fkid_articulo = ${id}`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    data,
                    code,
                };
            }
            return {
                data,
                tags: helper_1.helper.emptyOrRows(tags),
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function addArticle(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        console.log(body.article.fkid_category, "id_fk");
        try {
            const [article] = yield connection.execute(`INSERT INTO articulo (creador, creacion, titulo, body, lugar, descripcion, thumb, fkid_category)
            VALUES ('${body.article.creador}', '${body.article.creacion}', '${body.article.titulo}', '${body.article.body}', '${body.article.lugar}', '${body.article.descripcion}', '${body.article.thumb}', ${body.article.fkid_category})`);
            const articleId = article.insertId;
            for (let tag of body.tags) {
                yield connection.execute(`INSERT INTO tags (fkid_articulo, label)
                VALUES ('${articleId}', '${tag.label.toUpperCase()}')`);
            }
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function email(body) {
    return __awaiter(this, void 0, void 0, function* () {
        // Configuración de nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com", // Dirección del servidor SMTP de Hostinger
            port: 465, // Puerto SMTP de Hostinger (puede variar, comprueba la documentación de Hostinger)
            secure: true, // Enviar correos electrónicos de forma segura
            auth: {
                user: "josedelaoholguin@durangueneidad.com", // Nombre de usuario SMTP de Hostinger
                pass: "Mexico1.", // Contraseña SMTP de Hostinger
            },
        });
        const { nombre, correo, mensaje } = body;
        // Configuración del correo electrónico
        const mailOptions = {
            from: "josedelaoholguin@durangueneidad.com",
            to: "delao_holguin@hotmail.com", // Correo electrónico de destino
            subject: `Mensaje a la pagina Durangueneidad de ${nombre} (${correo})`,
            text: mensaje,
        };
        // Envío del correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                return 401;
            }
            else {
                console.log("Correo enviado:", info.response);
                return 201;
            }
        });
    });
}
function addBook(body, files) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 201;
        const { titulo, descripcion, fecha_publicacion, autor, tags } = body;
        // Inicia la transacción
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.beginTransaction();
        try {
            const random = Math.floor(Math.random() * 90000) + 10000;
            const fileNameImage = `image_${random}_${autor
                .split(" ")
                .join("_")}_${files["imagen_portada"][0].originalname
                .split(" ")
                .join("_")}`;
            const fileNamePDF = `pdf_${random}_${autor.split(" ").join("_")}_${files["archivo_pdf"][0].originalname
                .split(" ")
                .join("_")}`;
            // Guarda el libro en la base de datos
            const libroInsertResult = yield connection.execute("INSERT INTO libro (titulo, descripcion, fecha_publicacion, autor, imagen_portada, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?)", [
                titulo,
                descripcion,
                fecha_publicacion,
                autor,
                fileNameImage,
                fileNamePDF,
            ]);
            const libroId = libroInsertResult[0].insertId;
            // Guarda los tags asociados al libro
            const tagsArray = tags.split(",").map((tag) => tag.trim());
            tagsArray.map((tag) => __awaiter(this, void 0, void 0, function* () {
                yield connection.execute(`INSERT INTO tags_libro (label, fkid_libro) VALUES ('${tag}', ${libroId})`); // Inserta el tag o actualiza si ya existe
            }));
            // Guarda el archivo PDF en el servidor FTP
            yield (0, fts_service_1.ftpSend)(fileNameImage, files["imagen_portada"][0]); // Reemplaza con la lógica para guardar en FTP
            yield (0, fts_service_1.ftpSend)(fileNamePDF, files["archivo_pdf"][0]); // Reemplaza con la lógica para guardar en FTP
            // Confirma la transacción
            yield connection.commit();
            // Envía una respuesta de éxito
            return { code, message: "Libro agregado exitosamente" };
        }
        catch (error) {
            // Si ocurre un error, hace un rollback de la transacción
            yield connection.rollback();
            code = 405;
            console.error("Error al agregar el libro:", error);
            return { code, error };
        }
    });
}
function getBooks(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM libro ${id ? `WHERE id = ${id}` : ""}`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    data,
                    code,
                };
            }
            let tags = null;
            if (id) {
                tags = yield db_1.dbDurangeneidad.query(`SELECT *
        FROM tags_libro
        WHERE fkid_libro = ${id}`);
            }
            else {
                tags = yield db_1.dbDurangeneidad.query(`SELECT label, COUNT(*) AS count
        FROM tags_libro
        GROUP BY label;`);
            }
            return {
                data,
                tags: helper_1.helper.emptyOrRows(tags),
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function editBook(id, body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const libroId = id;
        const { titulo, descripcion, autor, fecha_publicacion, tags } = body;
        try {
            // Actualiza el libro en la base de datos
            const result = yield db_1.dbDurangeneidad.query("UPDATE libro SET titulo=?, descripcion=?, autor=?, fecha_publicacion=? WHERE id=?", [titulo, descripcion, autor, fecha_publicacion, libroId]);
            // Actualiza los tags asociados al libro
            const tagsArray = tags.split(",").map((tag) => tag.trim());
            yield db_1.dbDurangeneidad.query(`DELETE FROM tags_libro WHERE fkid_libro=${libroId}`); // Elimina los tags anteriores
            tagsArray.map((tag) => __awaiter(this, void 0, void 0, function* () {
                yield db_1.dbDurangeneidad.query(`INSERT INTO tags_libro (label, fkid_libro) VALUES ('${tag}', ${libroId})`); // Inserta el tag o actualiza si ya existe
            }));
            // Verifica si el libro fue encontrado y actualizado
            if (result.affectedRows === 0) {
                code = 404;
                return { code, error: "Libro no encontrado" };
            }
            // Envía una respuesta de éxito
            return { code, message: "Libro actualizado exitosamente" };
        }
        catch (error) {
            console.error("Error al actualizar el libro:", error);
            code = 405;
            return { code, error: "Error interno del servidor" };
        }
    });
}
function editArticle(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const articuloId = id;
        const { creador, creacion, titulo, body, lugar, thumb, descripcion, fkid_category, } = data.article;
        const tagsArr = data.tags;
        const tags = tagsArr.map((tag) => tag.label).join(", ");
        try {
            // Actualiza el libro en la base de datos
            const result = yield db_1.dbDurangeneidad.query("UPDATE articulo SET creador=?, creacion=?, titulo=?, body=?, lugar=?, descripcion=?, thumb=?, fkid_category=? WHERE id=?", [
                creador,
                creacion,
                titulo,
                body,
                lugar,
                descripcion,
                thumb,
                fkid_category,
                articuloId,
            ]);
            // Actualiza los tags asociados al libro
            const tagsArray = tags.split(",").map((tag) => tag.trim());
            yield db_1.dbDurangeneidad.query(`DELETE FROM tags WHERE fkid_articulo=${articuloId}`); // Elimina los tags anteriores
            tagsArray.map((tag) => __awaiter(this, void 0, void 0, function* () {
                yield db_1.dbDurangeneidad.query(`INSERT INTO tags (label, fkid_articulo) VALUES ('${tag}', ${articuloId})`); // Inserta el tag o actualiza si ya existe
            }));
            // Verifica si el libro fue encontrado y actualizado
            if (result.affectedRows === 0) {
                code = 404;
                return { code, error: "Articulo no encontrado" };
            }
            // Envía una respuesta de éxito
            return { code, message: "Articulo actualizado exitosamente" };
        }
        catch (error) {
            console.error("Error al actualizar el Articulo:", error);
            code = 405;
            return { code, error: error.message };
        }
    });
}
function removeArticle(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const result = yield db_1.dbDurangeneidad.query("DELETE FROM articulo WHERE id=?", [id]);
            if (result.affectedRows === 0) {
                code = 404;
                return { code, error: "Articulo no encontrado" };
            }
            const tagsResult = yield db_1.dbDurangeneidad.query("DELETE FROM tags WHERE fkid_articulo=?", [id]);
            if (tagsResult.affectedRows === 0) {
                code = 404;
                return { code, error: "Tags no encontrados" };
            }
            return { code, message: "Articulo eliminado exitosamente" };
        }
        catch (error) {
            console.error("Error al eliminar el articulo:", error);
            code = 405;
            return { code, error: error.message };
        }
    });
}
function removeBook(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const result = yield db_1.dbDurangeneidad.query("DELETE FROM libro WHERE id=?", [
                id,
            ]);
            if (result.affectedRows === 0) {
                code = 404;
                return { code, error: "Libro no encontrado" };
            }
            const tagsResult = yield db_1.dbDurangeneidad.query("DELETE FROM tags_libro WHERE fkid_libro=?", [id]);
            if (tagsResult.affectedRows === 0) {
                code = 404;
                return { code, error: "Tags no encontrados" };
            }
            return { code, message: "Libro eliminado exitosamente" };
        }
        catch (error) {
            console.error("Error al eliminar el libro:", error);
            code = 405;
            return { code, error: error.message };
        }
    });
}
function addAdvice(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            if (body.id !== 0) {
                yield connection.execute(`UPDATE avisos SET descripcion = '${body.descripcion}', autor = '${body.autor}', fecha = '${body.date}' WHERE id = ${body.id}`);
                yield connection.commit();
                return { code: 201 };
            }
            const [advice] = yield connection.execute(`INSERT INTO avisos (descripcion, autor, fecha)
            VALUES ('${body.descripcion}', '${body.autor}', '${body.date}')`);
            yield connection.commit();
            return { code: 201, data: advice };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return { code: 405 };
        }
    });
}
function getAdvice(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM avisos ${id ? `WHERE id = ${id}` : ""}`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    code,
                };
            }
            return {
                data,
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function createConfiguration(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        console.log(body);
        try {
            if (body.id !== 0) {
                yield connection.execute(`UPDATE configuraciones SET codigo = '${body.codigo}', valor = '${body.valor}', descripcion = '${body.descripcion}', type = '${body.tipo}' WHERE id = ${body.id}`);
                yield connection.commit();
                return { code: 201 };
            }
            const [config] = yield connection.execute(`INSERT INTO configuraciones (codigo, valor, descripcion, type)
            VALUES ('${body.codigo}', '${body.valor}', '${body.descripcion}', '${body.tipe}')`);
            yield connection.commit();
            return { code: 201, data: config };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function createConfigurationImage(body, files) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            let fileNameImage = "";
            console.log(body, files);
            const extension = path_1.default.extname(files["imagen"][0].originalname);
            fileNameImage = `${body.codigo}${Math.floor(Math.random() * 90000) + 10000}${extension}`;
            // Guarda el archivo PDF en el servidor FTP
            yield (0, fts_service_1.ftpSend)(fileNameImage, files["imagen"][0]); // Reemplaza con la lógica para guardar en FTP
            if (Number(body.id) !== 0) {
                yield connection.execute(`UPDATE configuraciones SET codigo = '${body.codigo}', valor = '${fileNameImage}', descripcion = '${body.descripcion}', type = '${body.tipo}' WHERE id = ${body.id}`);
                yield connection.commit();
                return { code: 201 };
            }
            const [config] = yield connection.execute(`INSERT INTO configuraciones (codigo, valor, descripcion, type)
            VALUES ('${body.codigo}', '${fileNameImage}', '${body.descripcion}', '${body.tipo}')`);
            yield connection.commit();
            return { code: 201, data: config };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function getConfiguration(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM configuraciones ${id ? `WHERE id = ${id}` : ""}`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    code,
                };
            }
            return {
                data,
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function getCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM categories`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    code,
                };
            }
            return {
                data,
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function addCategory(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            console.log(body);
            const [category] = yield connection.execute(`INSERT INTO categories (nombre, descripcion)
            VALUES ('${body.nombre}', '${body.descripcion}')`);
            yield connection.commit();
            return { code: 201, data: category };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function updateCategory(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            const [category] = yield connection.execute(`UPDATE categories SET nombre = '${body.nombre}', descripcion = '${body.descripcion}' WHERE id = ${body.id}`);
            yield connection.commit();
            return { code: 201, data: category };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
function uploadBio(body, files) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 201;
        const { biografia } = body;
        // Inicia la transacción
        const connection = yield db_1.dbDurangeneidad.connection();
        yield connection.beginTransaction();
        try {
            let fileNameImage = "";
            console.log(files.imagen_perfil);
            if (files.imagen_perfil.length > 0) {
                const extension = path_1.default.extname(files["imagen_perfil"][0].originalname);
                fileNameImage = `biografia${Math.floor(Math.random() * 90000) + 10000}${extension}`;
                // Guarda el archivo PDF en el servidor FTP
                yield (0, fts_service_1.ftpSend)(fileNameImage, files["imagen_perfil"][0]); // Reemplaza con la lógica para guardar en FTP
                yield connection.execute("UPDATE biografia SET imagen = ? where id = 1", [
                    fileNameImage,
                ]);
            }
            // Guarda el libro en la base de datos
            yield connection.execute("UPDATE biografia SET  biografia = ? where id = 1", [biografia]);
            // Confirma la transacción
            yield connection.commit();
            // Envía una respuesta de éxito
            return { code, message: "Biografia Actualizada" };
        }
        catch (error) {
            // Si ocurre un error, hace un rollback de la transacción
            yield connection.rollback();
            code = 405;
            console.error("Error al actualizar", error);
            return { code, error };
        }
    });
}
function getBio() {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.dbDurangeneidad.query(`SELECT * FROM biografia`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    code,
                };
            }
            return {
                data,
                code,
            };
        }
        catch (error) {
            console.error(error);
            return { code: 401, error };
        }
    });
}
module.exports = {
    login,
    getBio,
    getTags,
    getArt,
    getDetail,
    uploadBio,
    email,
    addArticle,
    updateCategory,
    addBook,
    getBooks,
    editBook,
    editArticle,
    removeArticle,
    addCategory,
    removeBook,
    addAdvice,
    getAdvice,
    createConfiguration,
    createConfigurationImage,
    getConfiguration,
    getCategories,
};
