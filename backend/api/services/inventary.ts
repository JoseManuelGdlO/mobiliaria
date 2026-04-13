import { db } from './db';
import { helper } from '../helper';

const parseOptionalNumber = (value: any) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

const parseOptionalText = (value: any) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (!text.length) return null;
    return text;
}

const parseUsage = (value: any) => {
    const usage = parseOptionalText(value)?.toLowerCase();
    if (!usage) return null;
    if (!['indoor', 'outdoor', 'both'].includes(usage)) return null;
    return usage;
}

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

async function getPackages(id: number) {
    let code = 200;

    const pkts = await db.query(
        `SELECT * FROM paquetes WHERE fkid_empresa = ${id} AND eliminado = 0 order by fecha`
    );

    let data = helper.emptyOrRows(pkts);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    for(let pkt of pkts) {
        const products = await db.query(
            `SELECT * FROM paquete_inventario P
            LEFT JOIN inventario_mob I
            ON P.fkid_inventario = I.id_mob
            WHERE fkid_paquete = ${pkt.id}`
        );
        
        pkt.products = products;
    }

    return {
        data: pkts,
        code
    }
}

async function removePackage(id: number) {
    let code = 201;

    try {
        const pkts = await db.query(
            `update paquetes set eliminado = 1
             WHERE id = ${id}`
        );

        return {
            data: pkts,
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

async function addPackage(id: number, body:any) {
    let code = 201;    

    const connection = await db.connection();
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

    await connection.beginTransaction();

    try {
        const [pkt]: any = await connection.execute(
        `INSERT INTO paquetes (nombre, precio, fkid_empresa, descripcion)
            VALUES ('${body.name}', '${body.price}', ${id},'${body.description}')`
        )

        for (let i = 0; i < body.products.length; i++) {
            await connection.execute(
                `INSERT INTO paquete_inventario (fkid_paquete, fkid_inventario, cantidad)
                    VALUES (${pkt.insertId}, ${body.products[i].id}, ${body.products[i].quantity})`
            )
        }


        await connection.commit()
        return {
            data: pkt,
            code
        }
    } catch (error) {
        console.error(error);
        connection.rollback();
        console.info('Rollback successful');
        
        code = 500;
        return {
            code,
            data: error
        }
    } finally {
        connection.release();
    }

}

async function addInventary(body: any, id: number ) {
    let code = 200;

    try {
        const anchoCm = parseOptionalNumber(body.widthCm);
        const altoCm = parseOptionalNumber(body.heightCm);
        const fondoCm = parseOptionalNumber(body.depthCm);
        const pesoKg = parseOptionalNumber(body.weightKg);
        const usoEspacio = parseUsage(body.spaceUsage);
        const estilo = parseOptionalText(body.style);
        const color = parseOptionalText(body.color);
        const material = parseOptionalText(body.material);

        const rows = await db.query(
        `INSERT INTO inventario_mob (id_empresa, cantidad_mob, nombre_mob, costo_mob, extra_mob, extra_mob_costo, ruta_imagen, eliminado, ancho_cm, alto_cm, fondo_cm, peso_kg, uso_espacio, estilo, color, material)
            VALUES (${id},${body.quantity},'${body.name}','${body.price}', null, '0', '', '0', ${anchoCm === null ? 'NULL' : anchoCm}, ${altoCm === null ? 'NULL' : altoCm}, ${fondoCm === null ? 'NULL' : fondoCm}, ${pesoKg === null ? 'NULL' : pesoKg}, ${usoEspacio === null ? 'NULL' : `'${usoEspacio}'`}, ${estilo === null ? 'NULL' : `'${estilo}'`}, ${color === null ? 'NULL' : `'${color}'`}, ${material === null ? 'NULL' : `'${material}'`})`
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

async function removeInventary(id: number, companyId: number) {
    let code = 200;

    try {
        const rows = await db.query(
            `UPDATE inventario_mob SET eliminado = '1' 
                WHERE id_mob = ${id} AND id_empresa = ${companyId}`
        )

        if (!rows.affectedRows) {
            return {
                code: 404,
                data: {
                    message: 'Inventario no encontrado para esta empresa'
                }
            }
        }

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
        const anchoCm = parseOptionalNumber(body.widthCm);
        const altoCm = parseOptionalNumber(body.heightCm);
        const fondoCm = parseOptionalNumber(body.depthCm);
        const pesoKg = parseOptionalNumber(body.weightKg);
        const usoEspacio = parseUsage(body.spaceUsage);
        const estilo = parseOptionalText(body.style);
        const color = parseOptionalText(body.color);
        const material = parseOptionalText(body.material);

        const rows = await db.query(
            `UPDATE inventario_mob SET cantidad_mob = ${body.quantity}, nombre_mob = '${body.name}', costo_mob = '${body.price}',
                ancho_cm = ${anchoCm === null ? 'NULL' : anchoCm},
                alto_cm = ${altoCm === null ? 'NULL' : altoCm},
                fondo_cm = ${fondoCm === null ? 'NULL' : fondoCm},
                peso_kg = ${pesoKg === null ? 'NULL' : pesoKg},
                uso_espacio = ${usoEspacio === null ? 'NULL' : `'${usoEspacio}'`},
                estilo = ${estilo === null ? 'NULL' : `'${estilo}'`},
                color = ${color === null ? 'NULL' : `'${color}'`},
                material = ${material === null ? 'NULL' : `'${material}'`}
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
    getPackages,
    removePackage,
    removeInventary,
    updateInventary,
    addPackage,
    addInventary
}