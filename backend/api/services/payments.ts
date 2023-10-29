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


async function addPayment(body: any) {
    let code = 200;

    const rows = await db.query(
        `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo, fecha, abono ) VALUE
            (${body.id_evento}, ${body.total}, ${body.saldo}, ${body.anticipo}, ${new Date().toISOString().split('T')[0]}, ${body.abono})`
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
    getPayments,
    addPayment
}