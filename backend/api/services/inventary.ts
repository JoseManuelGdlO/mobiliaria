import { db } from './db';
import { helper } from '../helper';

async function getInventary(id: number) {
    let code = 200;

    const rows = await db.query(
        `SELECT * FROM inventario_mob WHERE id_empresa = ${id} AND eliminado = 0 order by nombre_mob`
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
    getInventary
}