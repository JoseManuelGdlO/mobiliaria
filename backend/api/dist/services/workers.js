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
const perfLog_1 = require("../libs/perfLog");
const roles_1 = require("../libs/roles");
function getWorkers(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        console.log('id', id);
        const rows = yield db_1.db.query(`SELECT * FROM usuarios_mobiliaria WHERE id_empresa = ? AND admin is null AND delete_usuario is NULL order by nombre_comp`, [id]);
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
        const startedAt = Date.now();
        let code = 200;
        const eventsDelivery = yield db_1.db.query(`SELECT * FROM evento_mob WHERE id_empresa = ? AND fecha_envio_evento = ? ORDER BY hora_envio_evento `, [id, date]);
        let dataEventsDelivery = helper_1.helper.emptyOrRows(eventsDelivery);
        if (dataEventsDelivery.length === 0) {
            code = 404;
            (0, perfLog_1.perfLog)('workers.getEventsDay', startedAt);
            return {
                dataEventsDelivery,
                code
            };
        }
        const eventIds = dataEventsDelivery.map((e) => e.id_evento);
        const placeholders = eventIds.map(() => '?').join(',');
        const invRows = yield db_1.db.query(`SELECT D.id_evento, D.id_mob, D.ocupados, I.nombre_mob
         FROM inventario_disponibilidad_mob D
         LEFT JOIN inventario_mob I ON D.id_mob = I.id_mob
         WHERE D.id_evento IN (${placeholders})`, eventIds);
        const invByEvent = new Map();
        for (const row of helper_1.helper.emptyOrRows(invRows)) {
            const eid = Number(row.id_evento);
            const slice = { id_mob: row.id_mob, ocupados: row.ocupados, nombre_mob: row.nombre_mob };
            const list = invByEvent.get(eid);
            if (list) {
                list.push(slice);
            }
            else {
                invByEvent.set(eid, [slice]);
            }
        }
        const withTipo = (rows, tipo) => rows.map((event) => {
            var _a;
            return (Object.assign(Object.assign({}, event), { inventario: (_a = invByEvent.get(Number(event.id_evento))) !== null && _a !== void 0 ? _a : [], tipo_evento: tipo, lastSeenAt: null, accuracy: null, isOnline: false }));
        });
        const dataEnvio = withTipo(dataEventsDelivery, 'envio');
        const dataRecoleccion = withTipo(dataEventsDelivery, 'recoleccion');
        (0, perfLog_1.perfLog)('workers.getEventsDay', startedAt);
        return {
            data: [...dataEnvio, ...dataRecoleccion],
            code
        };
    });
}
function addWorker(body, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        if (!(0, roles_1.isAllowedRole)(body === null || body === void 0 ? void 0 : body.userType)) {
            return {
                data: { error: 'invalid role' },
                code: 400
            };
        }
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
        if (!(0, roles_1.isAllowedRole)(body === null || body === void 0 ? void 0 : body.rol_usuario)) {
            return {
                data: { error: 'invalid role' },
                code: 400
            };
        }
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
