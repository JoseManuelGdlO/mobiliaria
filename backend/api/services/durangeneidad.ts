import { dbDurangeneidad } from "./db";
import { helper } from "../helper";
import { ftpSend } from "../libs/fts-service";
const nodemailer = require("nodemailer");

async function login(body: any) {
  let code = 200;
  const rows = await dbDurangeneidad.query(
    `SELECT * FROM usuarios
      WHERE email = "${body.email}" AND contrasena = "${body.password}"`
  );

  let data = helper.emptyOrRows(rows);
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
}

async function getTags() {
  let code = 200;

  const rows = await dbDurangeneidad.query(`SELECT * FROM tags`);

  let data = helper.emptyOrRows(rows);
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
}

async function getArt(filter?: string) {
  let code = 200;

  let query = "SELECT * FROM articulo";

  if (filter) {
    query = `SELECT *
        FROM articulo
        WHERE id IN (
            SELECT fkid_articulo
            FROM tags
            WHERE label = '${filter}'
        );`;
  }


  const rows = await dbDurangeneidad.query(query);

  
  const tags = await dbDurangeneidad.query(`SELECT label, COUNT(*) AS count
  FROM tags
  GROUP BY label;`);

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    code = 404;
    return {
      data,
      code,
    };
  }

  return {
    data,
    tags: helper.emptyOrRows(tags),
    code,
  };
}

async function getDetail(id: number) {
  let code = 200;
  try {
    const rows = await dbDurangeneidad.query(
      `SELECT * FROM articulo
        WHERE id = ${id}`
    );
    const tags = await dbDurangeneidad.query(
      `SELECT * FROM tags
        WHERE fkid_articulo = ${id}`
    );
    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
      code = 404;
      return {
        data,
        code,
      };
    }
    return {
      data,
      tags: helper.emptyOrRows(tags),
      code,
    };
  } catch (error) {
    console.error(error);
    return { code: 401, error };
  }
}

async function addArticle(body: any) {
  const connection = await dbDurangeneidad.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();

  try {
    const [article] = await connection.execute(
      `INSERT INTO articulo (creador, creacion, titulo, body, lugar, descripcion, thumb)
            VALUES ('${body.article.creador}', '${body.article.creacion}', '${body.article.titulo}', '${body.article.body}', '${body.article.lugar}', '${body.article.descripcion}', '${body.article.thumb}')`
    );

    const articleId = article.insertId;

    for (let tag of body.tags) {
      await connection.execute(
        `INSERT INTO tags (fkid_articulo, label)
                VALUES ('${articleId}', '${tag.label.toUpperCase()}')`
      );
    }

    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

async function email(body: any) {
  // Configuración de nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Dirección del servidor SMTP de Hostinger
    port: 465, // Puerto SMTP de Hostinger (puede variar, comprueba la documentación de Hostinger)
    secure: true, // Enviar correos electrónicos de forma segura
    auth: {
      user: "josedelaoholguin@durangeneidad.com", // Nombre de usuario SMTP de Hostinger
      pass: "Mexico1.", // Contraseña SMTP de Hostinger
    },
  });

  const { nombre, correo, mensaje } = body;

  // Configuración del correo electrónico
  const mailOptions = {
    from: "josedelaoholguin@durangeneidad.com",
    to: "josedelaoholguin@durangeneidad.com", // Correo electrónico de destino
    subject: `Mensaje a la pagina Durangueneidad de ${nombre} (${correo})`,
    text: mensaje,
  };

  // Envío del correo electrónico
  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return 401;
    } else {
      console.log("Correo enviado:", info.response);
      return 201;
    }
  });
}

async function addBook(body: any, files: any) {
  let code = 201;
  const { titulo, descripcion, fecha_publicacion, autor, tags } = body;
  // Inicia la transacción
  const connection = await dbDurangeneidad.connection();
  await connection.beginTransaction();

  try {
    const random = Math.floor(Math.random() * 90000) + 10000;
    const fileNameImage = `image_${random}_${autor
      .split(" ")
      .join("_")}_${files["imagen_portada"][0].originalname
      .split(" ")
      .join("_")}`;
    const fileNamePDF = `pdf_${random}_${autor.split(" ").join("_")}_${files[
      "archivo_pdf"
    ][0].originalname
      .split(" ")
      .join("_")}`;

    // Guarda el libro en la base de datos
    const libroInsertResult = await connection.execute(
      "INSERT INTO libro (titulo, descripcion, fecha_publicacion, autor, imagen_portada, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?)",
      [
        titulo,
        descripcion,
        fecha_publicacion,
        autor,
        fileNameImage,
        fileNamePDF,
      ]
    );

    const libroId = libroInsertResult[0].insertId;

    // Guarda los tags asociados al libro
    const tagsArray = tags.split(",").map((tag: string) => tag.trim());
    tagsArray.map(async (tag: any) => {
      await connection.execute(
        `INSERT INTO tags_libro (label, fkid_libro) VALUES ('${tag}', ${libroId})`
      ); // Inserta el tag o actualiza si ya existe
    });

    // Guarda el archivo PDF en el servidor FTP
    await ftpSend(fileNameImage, files["imagen_portada"][0]); // Reemplaza con la lógica para guardar en FTP
    await ftpSend(fileNamePDF, files["archivo_pdf"][0]); // Reemplaza con la lógica para guardar en FTP

    // Confirma la transacción
    await connection.commit();

    // Envía una respuesta de éxito
    return { code, message: "Libro agregado exitosamente" };
  } catch (error) {
    // Si ocurre un error, hace un rollback de la transacción
    await connection.rollback();
    code = 405;
    console.error("Error al agregar el libro:", error);
    return { code, error };
  }
}

async function getBooks(id: number) {
  let code = 200;
  try {
    const rows = await dbDurangeneidad.query(
      `SELECT * FROM libro ${id ? `WHERE id = ${id}` : ""}`
    );
    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
      code = 404;
      return {
        data,
        code,
      };
    }
    let tags = null;
    if (id) {
      tags = await dbDurangeneidad.query(
        `SELECT *
        FROM tags_libro
        WHERE fkid_libro = ${id}`
      );
    } else {
      tags = await dbDurangeneidad.query(
        `SELECT label, COUNT(*) AS count
        FROM tags_libro
        GROUP BY label;`
      );
    }

    return {
      data,
      tags: helper.emptyOrRows(tags),
      code,
    };
  } catch (error) {
    console.error(error);
    return { code: 401, error };
  }
}

async function editBook(id: number, body: any) {
  let code = 200;
  const libroId = id;
  const { titulo, descripcion, autor, fecha_publicacion, tags } = body;

  try {
    // Actualiza el libro en la base de datos
    const result = await dbDurangeneidad.query(
      "UPDATE libro SET titulo=?, descripcion=?, autor=?, fecha_publicacion=? WHERE id=?",
      [titulo, descripcion, autor, fecha_publicacion, libroId]
    );

    // Actualiza los tags asociados al libro
    const tagsArray = tags.split(",").map((tag: string) => tag.trim());
    await dbDurangeneidad.query(
      `DELETE FROM tags_libro WHERE fkid_libro=${libroId}`
    ); // Elimina los tags anteriores
    tagsArray.map(async (tag: any) => {
      await dbDurangeneidad.query(
        `INSERT INTO tags_libro (label, fkid_libro) VALUES ('${tag}', ${libroId})`
      ); // Inserta el tag o actualiza si ya existe
    });

    // Verifica si el libro fue encontrado y actualizado
    if (result.affectedRows === 0) {
      code = 404;
      return { code, error: "Libro no encontrado" };
    }

    // Envía una respuesta de éxito
    return { code, message: "Libro actualizado exitosamente" };
  } catch (error) {
    console.error("Error al actualizar el libro:", error);
    code = 405;
    return { code, error: "Error interno del servidor" };
  }
}

async function editArticle(id: number, data: any) {
  let code = 200;
  const articuloId = id;
  const { creador, creacion, titulo, body, lugar, thumb, descripcion } =
    data.article;
  const tagsArr = data.tags;
  const tags = tagsArr.map((tag: any) => tag.label).join(", ");

  try {
    // Actualiza el libro en la base de datos
    const result = await dbDurangeneidad.query(
      "UPDATE articulo SET creador=?, creacion=?, titulo=?, body=?, lugar=?, descripcion=?, thumb=? WHERE id=?",
      [creador, creacion, titulo, body, lugar, descripcion, thumb, articuloId]
    );

    // Actualiza los tags asociados al libro
    const tagsArray = tags.split(",").map((tag: string) => tag.trim());
    await dbDurangeneidad.query(
      `DELETE FROM tags WHERE fkid_articulo=${articuloId}`
    ); // Elimina los tags anteriores
    tagsArray.map(async (tag: any) => {
      await dbDurangeneidad.query(
        `INSERT INTO tags (label, fkid_articulo) VALUES ('${tag}', ${articuloId})`
      ); // Inserta el tag o actualiza si ya existe
    });

    // Verifica si el libro fue encontrado y actualizado
    if (result.affectedRows === 0) {
      code = 404;
      return { code, error: "Articulo no encontrado" };
    }

    // Envía una respuesta de éxito
    return { code, message: "Articulo actualizado exitosamente" };
  } catch (error: any) {
    console.error("Error al actualizar el Articulo:", error);
    code = 405;
    return { code, error: error.message };
  }
}

async function removeArticle(id: number) {
  let code = 200;
  try {
    const result = await dbDurangeneidad.query(
      "DELETE FROM articulo WHERE id=?",
      [id]
    );
    if (result.affectedRows === 0) {
      code = 404;
      return { code, error: "Articulo no encontrado" };
    }

    const tagsResult = await dbDurangeneidad.query(
      "DELETE FROM tags WHERE fkid_articulo=?",
      [id]
    );
    if (tagsResult.affectedRows === 0) {
      code = 404;
      return { code, error: "Tags no encontrados" };
    }

    return { code, message: "Articulo eliminado exitosamente" };
  } catch (error: any) {
    console.error("Error al eliminar el articulo:", error);
    code = 405;
    return { code, error: error.message };
  }
}

async function removeBook(id: number) {
  let code = 200;
  try {
    const result = await dbDurangeneidad.query("DELETE FROM libro WHERE id=?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      code = 404;
      return { code, error: "Libro no encontrado" };
    }

    const tagsResult = await dbDurangeneidad.query(
      "DELETE FROM tags_libro WHERE fkid_libro=?",
      [id]
    );
    if (tagsResult.affectedRows === 0) {
      code = 404;
      return { code, error: "Tags no encontrados" };
    }

    return { code, message: "Libro eliminado exitosamente" };
  } catch (error: any) {
    console.error("Error al eliminar el libro:", error);
    code = 405;
    return { code, error: error.message };
  }
}

module.exports = {
  login,
  getTags,
  getArt,
  getDetail,
  email,
  addArticle,
  addBook,
  getBooks,
  editBook,
  editArticle,
  removeArticle,
  removeBook,
};
