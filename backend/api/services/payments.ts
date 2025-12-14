import { db } from './db';
import { helper } from '../helper';
import { saveHistorical } from '../libs/historical';

async function getPayments(id: number) {
    let code = 200;

    const rows = await db.query(
        `SELECT *
        FROM evento_mob
        LEFT JOIN pagos_mob
        ON evento_mob.id_evento = pagos_mob.id_evento
        WHERE fecha_envio_evento LIKE '%202%'
        AND evento_mob.id_empresa = ${id}
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


async function addPayment(body: any, idUsuario: number) {
    let code = 200;
    const connection = await db.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();

    try {
        const rows = await connection.execute(
            `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo, fecha, abono ) VALUE
            (${body.id_evento}, ${body.total}, ${body.saldo}, ${body.anticipo}, '${new Date().toISOString().split('T')[0]}', ${body.abono})`
        );

        saveHistorical(body.id_evento, idUsuario, 'Abono', body.abono);

        let data = helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code
            }
        }

        if (body.saldo === 0) {
            await connection.execute(
                `UPDATE evento_mob SET pagado_evento = '1' WHERE id_evento = ${body.id_evento}`
            );
        }

        await connection.commit()

        return {
            data,
            code
        }


    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        return {
            data: error,
            code: 405
        }
    } finally {
        await connection.end();
    }

}

module.exports = {
    getPayments,
    addPayment
}