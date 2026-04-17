import { db } from './db';
import { helper } from '../helper';
import { generatePassword } from '../libs/encrypt';
import { perfLog } from '../libs/perfLog';
import { isAllowedRole } from '../libs/roles';

async function getWorkers(id: number) {
    let code = 200;

    console.log('id', id);
    
    const rows = await db.query(
        `SELECT * FROM usuarios_mobiliaria WHERE id_empresa = ? AND admin is null AND delete_usuario is NULL order by nombre_comp`,
        [id]
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
    const startedAt = Date.now();
    let code = 200;

    const eventsDelivery = await db.query(
        `SELECT e.*, rep.nombre_comp AS repartidor_nombre
         FROM evento_mob e
         LEFT JOIN usuarios_mobiliaria rep ON e.id_repartidor = rep.id_usuario
         WHERE e.id_empresa = ? AND e.fecha_envio_evento = ? ORDER BY e.hora_envio_evento `,
        [id, date]
    );

    let dataEventsDelivery = helper.emptyOrRows(eventsDelivery);
    if (dataEventsDelivery.length === 0) {
        code = 404;
        perfLog('workers.getEventsDay', startedAt);
        return {
            dataEventsDelivery,
            code
        }
    }

    const eventIds = dataEventsDelivery.map((e: any) => e.id_evento);
    const placeholders = eventIds.map(() => '?').join(',');
    const invRows = await db.query(
        `SELECT D.id_evento, D.id_mob, D.ocupados, I.nombre_mob
         FROM inventario_disponibilidad_mob D
         LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
         WHERE D.id_evento IN (${placeholders})`,
        eventIds
    );

    const invByEvent = new Map<number, any[]>();
    for (const row of helper.emptyOrRows(invRows) as any[]) {
        const eid = Number(row.id_evento);
        const slice = { id_mob: row.id_mob, ocupados: row.ocupados, nombre_mob: row.nombre_mob };
        const list = invByEvent.get(eid);
        if (list) {
            list.push(slice);
        } else {
            invByEvent.set(eid, [slice]);
        }
    }

    const withTipo = (rows: any[], tipo: string) =>
        rows.map((event: any) => ({
            ...event,
            inventario: invByEvent.get(Number(event.id_evento)) ?? [],
            tipo_evento: tipo,
            lastSeenAt: null,
            accuracy: null,
            isOnline: false,
        }));

    const dataEnvio = withTipo(dataEventsDelivery, 'envio');
    const dataRecoleccion = withTipo(dataEventsDelivery, 'recoleccion');

    perfLog('workers.getEventsDay', startedAt);
    return {
        data: [...dataEnvio, ...dataRecoleccion],
        code
    }
}


async function addWorker(body: any, id: number) {
    let code = 200;
    if (!isAllowedRole(body?.userType)) {
        return {
            data: { error: 'invalid role' },
            code: 400
        };
    }

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
    if (!isAllowedRole(body?.rol_usuario)) {
        return {
            data: { error: 'invalid role' },
            code: 400
        };
    }

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