"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const helper_1 = require("../helper");
function getInventary(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`SELECT * FROM inventario_mob WHERE id_empresa = ${id} AND eliminado = 0 order by nombre_mob`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code
            };
        }
        return {
            data,
            code
        };
    });
}
function getPackages(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const pkts = yield db_1.db.query(`SELECT * FROM paquetes WHERE fkid_empresa = ${id} AND eliminado = 0 order by fecha`);
        let data = helper_1.helper.emptyOrRows(pkts);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code
            };
        }
        for (let pkt of pkts) {
            const products = yield db_1.db.query(`SELECT * FROM paquete_inventario P
            LEFT JOIN inventario_mob I
            ON P.fkid_inventario = I.id_mob
            WHERE fkid_paquete = ${pkt.id}`);
            pkt.products = products;
        }
        return {
            data: pkts,
            code
        };
    });
}
function removePackage(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 201;
        try {
            const pkts = yield db_1.db.query(`update paquetes set eliminado = 1
             WHERE id = ${id}`);
            return {
                data: pkts,
                code
            };
        }
        catch (error) {
            code = 500;
            return {
                code,
                data: error
            };
        }
    });
}
function addPackage(id, body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 201;
        const connection = yield db_1.db.connection();
        yield connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        yield connection.beginTransaction();
        try {
            const [pkt,] = yield connection.execute(`INSERT INTO paquetes (nombre, precio, fkid_empresa, descripcion)
            VALUES ('${body.name}', '${body.price}', ${id},'${body.description}')`);
            for (let i = 0; i < body.products.length; i++) {
                yield connection.execute(`INSERT INTO paquete_inventario (fkid_paquete, fkid_inventario, cantidad)
                    VALUES (${pkt.insertId}, ${body.products[i].id}, ${body.products[i].quantity})`);
            }
            yield connection.commit();
            return {
                data: pkt,
                code
            };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info('Rollback successful');
            code = 500;
            return {
                code,
                data: error
            };
        }
    });
}
function addInventary(body, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.db.query(`INSERT INTO inventario_mob (id_empresa, cantidad_mob, nombre_mob, costo_mob, extra_mob, extra_mob_costo, ruta_imagen, eliminado)
            VALUES (${id},${body.quantity},'${body.name}','${body.price}', null, '0', '', '0')`);
            return {
                data: rows,
                code
            };
        }
        catch (error) {
            console.log(error);
            code = 500;
            return {
                code,
                data: error
            };
        }
    });
}
function removeInventary(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.db.query(`UPDATE inventario_mob SET eliminado = '1' 
                WHERE id_mob = ${id}`);
            return {
                data: rows,
                code
            };
        }
        catch (error) {
            code = 500;
            return {
                code,
                data: error
            };
        }
    });
}
function updateInventary(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const rows = yield db_1.db.query(`UPDATE inventario_mob SET cantidad_mob = ${body.quantity}, nombre_mob = '${body.name}', costo_mob = '${body.price}'
                WHERE id_mob = ${body.id}`);
            return {
                data: rows,
                code
            };
        }
        catch (error) {
            code = 500;
            return {
                code,
                data: error
            };
        }
    });
}
module.exports = {
    getInventary,
    getPackages,
    removePackage,
    removeInventary,
    updateInventary,
    addPackage,
    addInventary
};
