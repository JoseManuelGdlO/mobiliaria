import { db } from './db';
import { helper } from '../helper';

async function getClients(id: number) {
    let code = 200;

    console.log('id', id);

    const rows = await db.query(
        `SELECT * FROM catalogo_clientes_mob WHERE id_empresa = ${id} order by nombre_cliente`
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

module.exports = {
    getClients
}