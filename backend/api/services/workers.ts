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

async function getEventsDay(id: number, date: string) {
    let code = 200;


    const eventsDelivery = await db.query(
        `SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento = '${date}' ORDER BY hora_envio_evento `
    );

    let dataEventsDelivery = helper.emptyOrRows(eventsDelivery);
    if (dataEventsDelivery.length === 0) {
        code = 404;
        return {
            dataEventsDelivery,
            code
        }
    }

    for (const event of dataEventsDelivery) {
        const inv = await db.query(
            `SELECT D.id_mob, D.ocupados, I.nombre_mob
            FROM inventario_disponibilidad_mob D
            LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
            WHERE id_evento = '${event.id_evento}'`
        );

        let dataInv = helper.emptyOrRows(inv);

        event.inventario = dataInv;
        event.tipo_evento = 'envio';
    }

    const eventReturn = await db.query(
        `SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento = '${date}' ORDER BY hora_envio_evento `
    );

    let dataeventReturn = helper.emptyOrRows(eventReturn);
    if (dataeventReturn.length === 0) {
        code = 404;
        return {
            dataeventReturn,
            code
        }
    }

    for (const event of dataeventReturn) {
        const inv = await db.query(
            `SELECT D.id_mob, D.ocupados, I.nombre_mob
            FROM inventario_disponibilidad_mob D
            LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
            WHERE id_evento = '${event.id_evento}'`
        );

        let dataInv = helper.emptyOrRows(inv);

        event.inventario = dataInv;
        event.tipo_evento = 'recoleccion';
    }

    return {
        data: {
            envio: dataEventsDelivery,
            recoleccion: dataeventReturn
        },
        code
    }
}

module.exports = {
    getWorkers,
    getEventsDay
}