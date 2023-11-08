import { db } from './db';
import { helper } from '../helper';

async function getInventary(id: number) {
    let code = 200;

    const rows = await db.query(
        `SELECT * FROM inventario_mob WHERE id_empresa = ${id} AND eliminado = 0 order by nombre_mob`
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

async function addInventary(body: any, id: number ) {
    let code = 200;

    try {
        const rows = await db.query(
        `INSERT INTO inventario_mob (id_empresa, cantidad_mob, nombre_mob, costo_mob, extra_mob, extra_mob_costo, ruta_imagen, eliminado)
            VALUES (${id},${body.quantity},'${body.name}','${body.price}', null, '0', '', '0')`
        )


        return {
            data: rows,
            code
        }
    } catch (error) {
        console.log(error);
        
        code = 500;
        return {
            code,
            data: error
        }
    }

}

async function removeInventary(id: number) {
    let code = 200;

    try {
        const rows = await db.query(
            `UPDATE inventario_mob SET eliminado = '1' 
                WHERE id_mob = ${id}`
        )


        return {
            data: rows,
            code
        }
    } catch (error) {
        code = 500;
        return {
            code,
            data: error
        }
    }

}

async function updateInventary (body: any) {
    let code = 200;

    try {
        const rows = await db.query(
            `UPDATE inventario_mob SET cantidad_mob = ${body.quantity}, nombre_mob = '${body.name}', costo_mob = '${body.price}'
                WHERE id_mob = ${body.id}`
        )

        return {
            data: rows,
            code
        }
    } catch (error) {
        code = 500;
        return {
            code,
            data: error
        }
    }

}

module.exports = {
    getInventary,
    removeInventary,
    updateInventary,
    addInventary
}