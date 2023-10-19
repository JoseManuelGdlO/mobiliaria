import { db } from './db';
import { helper } from '../helper';

async function getWorkers(id: number) {
    let code = 200;

    console.log('id', id);
    
    const rows = await db.query(
        `SELECT * FROM usuarios_mobiliaria WHERE id_empresa = ${id} AND admin is null order by nombre_comp`
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
    getWorkers
}