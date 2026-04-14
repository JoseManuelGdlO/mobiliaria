import { db } from './db';
import { helper } from '../helper';
import { saveHistorical } from '../libs/historical';

interface PaymentsQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

async function getPayments(id: number, query: PaymentsQuery = {}) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const search = query.search?.trim() || '';
    const status = query.status?.trim().toLowerCase() || '';
    const offset = helper.getOffset(page, pageSize);

    const whereClauses = ['evento_mob.id_empresa = ?'];
    const params: any[] = [id];

    if (search.length > 0) {
        whereClauses.push(`(
            evento_mob.nombre_evento LIKE ?
            OR evento_mob.nombre_titular_evento LIKE ?
            OR evento_mob.tipo_evento LIKE ?
            OR evento_mob.telefono_titular_evento LIKE ?
        )`);
        const searchLike = `%${search}%`;
        params.push(searchLike, searchLike, searchLike, searchLike);
    }

    if (status === 'paid' || status === '1') {
        whereClauses.push('evento_mob.pagado_evento = 1');
    } else if (status === 'pending' || status === '0') {
        whereClauses.push('evento_mob.pagado_evento = 0');
    }

    const whereSql = whereClauses.join(' AND ');
    const totalRows: any = await db.query(
        `SELECT COUNT(*) AS total
         FROM evento_mob
         LEFT JOIN pagos_mob
           ON evento_mob.id_evento = pagos_mob.id_evento
         WHERE ${whereSql}`,
        params
    );

    const total = Number(totalRows?.[0]?.total || 0);
    const rows = await db.query(
        `SELECT *
         FROM evento_mob
         LEFT JOIN pagos_mob
           ON evento_mob.id_evento = pagos_mob.id_evento
         WHERE ${whereSql}
         ORDER BY evento_mob.fecha_envio_evento ASC
         LIMIT ${Math.floor(pageSize)} OFFSET ${Math.floor(offset)}`,
        params
    );

    const items = helper.emptyOrRows(rows);
    const hasMore = offset + items.length < total;

    return {
        data: items,
        items,
        total,
        page,
        pageSize,
        hasMore,
        code: 200
    };
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
        connection.release();
    }

}

module.exports = {
    getPayments,
    addPayment
}