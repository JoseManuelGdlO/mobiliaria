import { db } from './db';
import { helper } from '../helper';

async function getReports(id: number, months: string) {
    let code = 200;
    console.log('moths', months);
    

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
        `WITH CTE AS (
    SELECT 
        id_evento, 
        costo_total,
        fecha,
        ROW_NUMBER() OVER (PARTITION BY id_evento ORDER BY id_pago DESC) AS rn
    FROM 
        pagos_mob
)

SELECT 
    id_evento, 
    costo_total
FROM 
    CTE 
WHERE 
    rn = 1 AND
    id_evento IN (
        SELECT 
            id_evento
        FROM 
            evento_mob
        WHERE
            id_empresa = ${id} AND
            fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
    );
`
    );
    console.log('rows2', rows2.length, rows2);
    
    let totalCost = helper.emptyOrRows(rows2);

    let total = 0
    let index = 0

    for (const event of totalCost) {
       total += event.costo_total
        index++
    }

    console.log(total, index);
    

    const rows3 = await db.query(
        `SELECT 
            telefono_titular_evento,
            COUNT(*) AS veces_agrupado,
            nombre_titular_evento
        FROM 
            evento_mob
        WHERE
            id_empresa = ${id} AND
            fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
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