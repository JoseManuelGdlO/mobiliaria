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
const encrypt_1 = require("../libs/encrypt");
function getWorkers(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        console.log('id', id);
        const rows = yield db_1.db.query(`SELECT * FROM usuarios_mobiliaria WHERE id_empresa = ${id} AND admin is null AND delete_usuario is NULL order by nombre_comp`);
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
function getEventsDay(id, date) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const eventsDelivery = yield db_1.db.query(`SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento = '${date}' ORDER BY hora_envio_evento `);
        let dataEventsDelivery = helper_1.helper.emptyOrRows(eventsDelivery);
        if (dataEventsDelivery.length === 0) {
            code = 404;
            return {
                dataEventsDelivery,
                code
            };
        }
        for (const event of dataEventsDelivery) {
            const inv = yield db_1.db.query(`SELECT D.id_mob, D.ocupados, I.nombre_mob
            FROM inventario_disponibilidad_mob D
            LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
            WHERE id_evento = '${event.id_evento}'`);
            let dataInv = helper_1.helper.emptyOrRows(inv);
            event.inventario = dataInv;
            event.tipo_evento = 'envio';
        }
        const eventReturn = yield db_1.db.query(`SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento = '${date}' ORDER BY hora_envio_evento `);
        let dataeventReturn = helper_1.helper.emptyOrRows(eventReturn);
        if (dataeventReturn.length === 0) {
            code = 404;
            return {
                dataeventReturn,
                code
            };
        }
        for (const event of dataeventReturn) {
            const inv = yield db_1.db.query(`SELECT D.id_mob, D.ocupados, I.nombre_mob
            FROM inventario_disponibilidad_mob D
            LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
            WHERE id_evento = '${event.id_evento}'`);
            let dataInv = helper_1.helper.emptyOrRows(inv);
            event.inventario = dataInv;
            event.tipo_evento = 'recoleccion';
        }
        return {
            data: [...dataEventsDelivery, ...dataeventReturn],
            code
        };
    });
}
function addWorker(body, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`INSERT INTO usuarios_mobiliaria (id_empresa, nombre_comp, contrasena, usuario, rol_usuario, fecha_creacion, correo, active)
        VALUES ('${id}', '${body.name}', '${body.pass}', '${body.user}', '${body.userType}', '${body.creation}', '${body.email}', ${body.active});`);
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
function editWorker(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET nombre_comp = '${body.nombre_comp}', contrasena = '${body.contrasena}', usuario = '${body.usuario}', rol_usuario = '${body.rol_usuario}', fecha_creacion = '${body.fecha_creacion}', correo = '${body.correo}', active = 1
                WHERE id_usuario = ${body.id_usuario}`);
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
function active(type, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET active = ${type}
                WHERE id_usuario = ${id}`);
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
function remove(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET delete_usuario = 1
                WHERE id_usuario = ${id}`);
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
function generePass(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET contrasena = ${(0, encrypt_1.generatePassword)()}
                WHERE id_usuario = ${id}`);
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
module.exports = {
    getWorkers,
    getEventsDay,
    addWorker,
    remove,
    active,
    generePass,
    editWorker
};
