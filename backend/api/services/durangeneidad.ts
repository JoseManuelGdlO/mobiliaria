import { dbDurangeneidad } from "./db";
import { helper } from "../helper";
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

async function getDetail(id: number) {
  let code = 200;
  let paso = 0;
  try {
    const rows = await dbDurangeneidad.query(
      `SELECT * FROM articulo
        WHERE id = ${id}`
    );
    paso = 1;
    const tags = await dbDurangeneidad.query(
      `SELECT * FROM tags
        WHERE fkid_articulo = ${id}`
    );
    paso = 2;
    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
      code = 404;
      return {
        data,
        code,
      };
    }
    paso = 3;
    return {
      data,
      tags: helper.emptyOrRows(tags),
      code,
    };
  } catch (error) {
    console.error(error);
    return { code: 401, data: paso, error, params: id};
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

module.exports = {
  login,
  getTags,
  getArt,
  getDetail,
  email,
  addArticle,
};
