import { dbDurangeneidad } from './db';
import { helper } from '../helper';

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
            code
        }
    }

    data = data[0]


    return {
        data,
        code
    }
}

async function getTags() {
    let code = 200;


    const rows = await dbDurangeneidad.query(
        `SELECT * FROM tags`
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    return {
        data,
        code
    }
}


async function getArt(filter?: string) {
    let code = 200;

    let query = 'SELECT * FROM articulo'

    if (filter) {
        query = `SELECT *
        FROM articulo
        WHERE id IN (
            SELECT fkid_articulo
            FROM tags
            WHERE label = '${filter}'
        );`
    }

    const rows = await dbDurangeneidad.query(
        query
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    return {
        data,
        code
    }
}


async function getDetail(id: number) {
    let code = 200;

    const rows = await dbDurangeneidad.query(
        `SELECT * FROM articulo
      WHERE id = ${id}`
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    return {
        data,
        code
    }
}

async function addArticle(body: any) {

    const connection = await dbDurangeneidad.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();

    try {
        
        const [article,] = await connection.execute(
            `INSERT INTO articulo (creador, creacion, titulo, body, lugar)
            VALUES ('${body.article.creador}', '${body.article.creacion}', '${body.article.titulo}', '${body.article.body}', '${body.article.lugar}')`
        );

        const articleId = article.insertId;

        for (let tag of body.tags) {
            await connection.execute(
                `INSERT INTO tags (fkid_articulo, label)
                VALUES ('${articleId}', '${tag.label}')`
            );
        }

       

        await connection.commit();
        return 201

    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        return 405
    }
}


module.exports = {
    login,
    getTags,
    getArt,
    getDetail,
    addArticle
}