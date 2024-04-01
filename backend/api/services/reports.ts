import { db } from './db';
import { helper } from '../helper';

async function getReports(id: number, months: string) {
    let code = 200;

    const rows = await db.query(
        `SELECT 
            i.id_mob,
            i.nombre_mob AS nombre_mobiliario,
            COUNT(*) AS veces_rentado,
            SUM(idm.ocupados) AS ocupados
        FROM inventario_mob AS i
        INNER
            JOIN inventario_disponibilidad_mob AS idm ON i.id_mob = idm.id_mob
        WHERE
            i.id_empresa = ${id} AND
            idm.fecha_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
        GROUP BY
            i.id_mob, i.nombre_mob
        ORDER BY
            veces_rentado DESC
        LIMIT 10;`
    );

    let mostRent = helper.emptyOrRows(rows);


    const rows2 = await db.query(
        `SELECT 
            em.id_evento,
            em.nombre_evento,
            SUM(pm.costo_total) AS costo_total_por_evento
        FROM 
            evento_mob AS em
        LEFT JOIN 
            pagos_mob AS pm ON em.id_evento = pm.id_evento
        WHERE
            em.id_empresa = ${id} AND
            em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
        GROUP BY 
            em.id_evento, em.nombre_evento;`
    );
    
    let totalCost = helper.emptyOrRows(rows2);

    let total = 0
    let index = 0

    for (const event of totalCost) {
       total += event.costo_total_por_evento
        index++
    }

    const rows3 = await db.query(
        `SELECT 
            telefono_titular_evento,
            COUNT(*) AS veces_agrupado,
            nombre_titular_evento
        FROM 
            evento_mob
        WHERE
            id_empresa = 1 AND
            fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        GROUP BY 
            nombre_titular_evento
        ORDER BY
            veces_agrupado DESC
        LIMIT 10;`
    );

    let Quantity = helper.emptyOrRows(rows3);

    return {
        data : {
            mostRent,
            eventos: {
                total: total,
                numero_eventos: index,
                promedio: total/index
            },
            Quantity      
        },
        code
    }
}

module.exports = {
    getReports
}