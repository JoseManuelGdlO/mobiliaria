import { db } from './db';
import { helper } from '../helper';
import { generatePassword } from '../libs/encrypt';

async function getWorkers(id: number) {
    let code = 200;

    console.log('id', id);
    
    const rows = await db.query(
        `SELECT * FROM usuarios_mobiliaria WHERE id_empresa = ${id} AND admin is null AND delete_usuario is NULL order by nombre_comp`
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
        data: [...dataEventsDelivery, ...dataeventReturn],
        code
    }
}


async function addWorker(body: any, id: number) {
    let code = 200;

    const rows = await db.query(
        `INSERT INTO usuarios_mobiliaria (id_empresa, nombre_comp, contrasena, usuario, rol_usuario, fecha_creacion, correo, active)
        VALUES ('${id}', '${body.name}', '${body.pass}', '${body.user}', '${body.userType}', '${body.creation}', '${body.email}', ${body.active});`
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

async function editWorker(body: any) {
    let code = 200;

    const rows = await db.query(
        `UPDATE usuarios_mobiliaria SET nombre_comp = '${body.nombre_comp}', contrasena = '${body.contrasena}', usuario = '${body.usuario}', rol_usuario = '${body.rol_usuario}', fecha_creacion = '${body.fecha_creacion}', correo = '${body.correo}', active = 1
                WHERE id_usuario = ${body.id_usuario}`
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

async function active(type: number, id: number) {
    let code = 200;

    const rows = await db.query(
        `UPDATE usuarios_mobiliaria SET active = ${type}
                WHERE id_usuario = ${id}`
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
    let code = 200;


    const rows = await db.query(
        `UPDATE usuarios_mobiliaria SET delete_usuario = 1
                WHERE id_usuario = ${id}`
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

async function generePass(id: number) {
    let code = 200;

    const rows = await db.query(
        `UPDATE usuarios_mobiliaria SET contrasena = ${generatePassword()}
                WHERE id_usuario = ${id}`
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
    getWorkers,
    getEventsDay,
    addWorker,
    remove,
    active,
    generePass,
    editWorker
}