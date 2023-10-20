import { db } from './db';
import { helper } from '../helper';

async function getPayments(id: number) {
    let code = 200;

    const rows = await db.query(
        `SELECT *
        FROM evento_mob, pagos_mob
        WHERE evento_mob.id_evento = pagos_mob.id_evento
        AND fecha_envio_evento LIKE '%202%'
        AND id_empresa = ${id}
        ORDER BY evento_mob.fecha_envio_evento;`
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
    getPayments
}