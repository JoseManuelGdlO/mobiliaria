import { db } from './db';
import { helper } from '../helper';

async function getEvents(id: number) {
    let code = 200;

    const rows = await db.query(
        `SELECT nombre_evento, fecha_envio_evento, COUNT(fecha_envio_evento) as total from evento_mob where id_empresa = "${id}" AND fecha_envio_evento LIKE "%202%" GROUP BY fecha_envio_evento`
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

async function getDetails(id: number) {
    let code = 200;
    try {


    let rows = await db.query(
        `select * from evento_mob where id_evento = '${id}'`
    );

    let event = helper.emptyOrRows(rows);
    if (event.length === 0) {
        code = 404;
        return {
            details: 'No se encontró el evento',
            event,
            code
        }
    }

    rows = await db.query(
        `select a.nombre_mob, a.costo_mob, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
		b.fecha_evento
		from inventario_mob a, inventario_disponibilidad_mob b where b.id_mob = a.id_mob and id_evento='${id}'`
    );

    let items = helper.emptyOrRows(rows);
    if (items.length === 0) {
        code = 404;
        return {
            details: 'No se encontraron los items',
            items,
            code
        }
    }

    rows = await db.query(
        `SELECT P.* 
        FROM pagos_mob P
        LEFT JOIN evento_mob E
        ON P.id_evento = E.id_evento
        WHERE P.id_evento ='${id}'`
    );

    let payments = helper.emptyOrRows(rows);
    if (payments.length === 0) {
        code = 404;
        return {
            details: 'No se encontraron los pagos',
            payments,
            code
        }
    }



    return {
        event: {
            event: event[0],
            payments,
            items,
        },
        code
    }
    } catch (error) {
        console.log(error);
        return {
            code: 500
        }
    }
}

async function getEventsOfDay(id: number, date: string) {
    let code = 200;    

    const rows = await db.query(
        `SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento='${date}'`
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

async function availiable(id: number, date: string) {
    let code = 200;

    const rows = await db.query(
        `
        SELECT 
            inv.id_mob,
            inv.nombre_mob,
            inv.cantidad_mob - COALESCE(SUM(dis.cantidad_rentada), 0) AS cantidad_mob,
            inv.costo_mob as costo_mob,
            inv.extra_mob as extra_mob,
            inv.extra_mob_costo as extra_mob_costo
        FROM 
            inventario_mob inv
        LEFT JOIN 
            (
                SELECT 
                    id_mob,
                    SUM(ocupados) AS cantidad_rentada
                FROM 
                    inventario_disponibilidad_mob
                WHERE 
                    DATE(fecha_evento) = '${date}'
                GROUP BY 
                    id_mob
            ) dis ON inv.id_mob = dis.id_mob
            WHERE inv.id_empresa = ${id} AND inv.eliminado = 0
        GROUP BY 
            inv.id_mob, inv.nombre_mob
        ORDER BY 
            inv.id_mob;`
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

async function addEvent(body: any, id: number) {

    const connection = await db.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();
    try {

        const [event,] = await connection.execute(
            `INSERT INTO evento_mob (nombre_evento, id_empresa, tipo_evento, fecha_envio_evento, hora_envio_evento, fecha_recoleccion_evento, hora_recoleccion_evento, pagado_evento, nombre_titular_evento, direccion_evento ,telefono_titular_evento, descuento, iva, flete)
            VALUES ('${body.evento.nombre_evento}',${id}, '${body.evento.tipo_evento}', '${body.evento.fecha_envio_evento}',
                 	'${body.evento.hora_envio_evento}', '${body.evento.fecha_recoleccion_evento}', '${body.evento.hora_recoleccion_evento}',
                 		'${body.evento.pagado_evento}', '${body.evento.nombre_titular_evento}', '${body.evento.direccion_evento}', '${body.evento.telefono_titular_evento}',
                 		${body.evento.descuento}, ${body.evento.ivavalor}, ${body.evento.fletevalor})`
        );

        for (const mobiliario of body.mobiliario) {
            await connection.execute(
                `INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES (${mobiliario.fecha_evento}, '${mobiliario.hora_evento}', ${mobiliario.id_mob}, ${mobiliario.ocupados},${event.insertId}, '${mobiliario.hora_recoleccion}', ${mobiliario.costo})`
            );
        }

        const [paymenth,] = await connection.execute(
            `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${event.insertId},${body.costo.costo_total},${body.costo.saldo},${body.costo.anticipo})`
        );

        await connection.commit()
        return 201

    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        return 405
    }
}



async function addItems(body: any) {

    const connection = await db.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();
    try {
        let [event,] = await connection.execute(
            `SELECT * FROM evento_mob WHERE id_evento = ${body.id}`
        );
        event = event[0]
        console.log(event);
        

        for (const mobiliario of body.items) {
            await connection.execute(
                `INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES (${event.fecha_envio_evento.toISOString().split('T')[0]}, '${event.hora_envio_evento}', ${mobiliario.id_mob}, ${mobiliario.cantidad_mob}, ${body.id}, '${event.fecha_recoleccion_evento.toISOString().split('T')[0]}', ${mobiliario.costo_mob})`
            );
        }

        await connection.commit()
        return 201
    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        return 405
    }
}

async function updateObvs(body: any) {
    let code = 200;
    
    const rows = await db.query(
        `UPDATE evento_mob SET observaciones = '${body.observaciones}'
                WHERE id_evento = ${body.id}`
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

async function changeStatus(id: number, delivered: number, recolected: number) {
    let code = 200;
    console.log(id, delivered, recolected);
    

    const rows = await db.query(
        `UPDATE evento_mob SET entregado = '${delivered}', recolectado = '${recolected}'
                WHERE id_evento = ${id}`
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

async function remove(id: number) {

    const connection = await db.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();
    try {
        let [event,] = await connection.execute(
            `DELETE FROM evento_mob WHERE id_evento = ${id}`
        );
        console.log(event);


        let [disponility,] = await connection.execute(
            `DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id}`
        );
        console.log(disponility);

        await connection.commit()
        return 201
    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        return 405
    }
}


module.exports = {
    getEvents,
    getEventsOfDay,
    availiable,
    addEvent,
    updateObvs,
    getDetails,
    changeStatus,
    remove,
    addItems
}