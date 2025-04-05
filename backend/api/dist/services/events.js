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
const historical_1 = require("../libs/historical");
const notifications_1 = require("../libs/notifications");
function getEvents(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`SELECT nombre_evento, fecha_envio_evento, COUNT(fecha_envio_evento) as total from evento_mob where id_empresa = "${id}" AND fecha_envio_evento LIKE "%202%" GROUP BY fecha_envio_evento`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        return {
            data,
            code,
        };
    });
}
function getDetails(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            let rows = yield db_1.db.query(`select * from evento_mob where id_evento = '${id}'`);
            let event = helper_1.helper.emptyOrRows(rows);
            if (event.length === 0) {
                code = 404;
                return {
                    details: "No se encontró el evento",
                    event,
                    code,
                };
            }
            rows = yield db_1.db.query(`select a.nombre_mob, b.costo, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
      b.fecha_evento, b.package
      from inventario_mob a, inventario_disponibilidad_mob b where b.id_mob = a.id_mob and id_evento='${id}' AND  b.package IS NULL`);
            let items = helper_1.helper.emptyOrRows(rows);
            rows = yield db_1.db.query(`select a.nombre, b.costo, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
      b.fecha_evento, b.package
      from paquetes a, inventario_disponibilidad_mob b where b.id_mob = a.id and id_evento='${id}' AND  b.package = 1`);
            let packages = helper_1.helper.emptyOrRows(rows);
            items = [...items, ...packages];
            rows = yield db_1.db.query(`SELECT P.* 
        FROM pagos_mob P
        LEFT JOIN evento_mob E
        ON P.id_evento = E.id_evento
        WHERE P.id_evento =${id}`);
            let payments = helper_1.helper.emptyOrRows(rows);
            if (payments.length === 0) {
                code = 404;
                return {
                    details: "No se encontraron los pagos",
                    payments,
                    code,
                };
            }
            const historial = yield db_1.db.query(`SELECT 
          h.id, 
          h.date, 
          h.description, 
          h.obs, 
          h.fkid_user,
          u.nombre_comp
      FROM 
          historical h
      JOIN 
          usuarios_mobiliaria u ON h.fkid_user = u.id_usuario
      AND
          h.fkid_event = ${id}`);
            return {
                event: {
                    event: event[0],
                    payments,
                    items,
                    historial
                },
                code,
            };
        }
        catch (error) {
            console.log(error);
            return {
                code: 500,
            };
        }
    });
}
function getEventsOfDay(id, date) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`SELECT 
        e.*,
        p.id_pago, 
        p.costo_total
    FROM 
        evento_mob e
    LEFT JOIN 
        pagos_mob p ON e.id_evento = p.id_evento
    WHERE 
        p.id_pago = (
            SELECT MAX(p2.id_pago)
            FROM pagos_mob p2
            WHERE p2.id_evento = e.id_evento
        )
    AND
      e.id_empresa = ${id}
    AND
      e.fecha_envio_evento = '${date}';`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        let total = 0;
        for (const event of data) {
            total += event.costo_total;
        }
        return {
            data,
            total,
            code,
        };
    });
}
function editEvent(body, idUser) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        try {
            const event = yield db_1.db.query(`SELECT * FROM evento_mob WHERE id_evento = ${body.id}`);
            if (event[0].length !== 0) {
                let change = '';
                if (event[0].nombre_titular_evento !== body.titular) {
                    change = `titular: ${event[0].nombre_titular_evento} a ${body.titular}, `;
                }
                if (event[0].telefono_titular_evento !== body.telefono) {
                    change = change + `telefono: ${event[0].telefono_titular_evento} a ${body.telefono}, `;
                }
                if (body.url && event[0].url !== body.url) {
                    change = change + `url = ${body.url}, `;
                }
                if (event[0].direccion_evento !== body.direccion) {
                    change = change + `direccion: ${event[0].direccion_evento} a ${body.direccion}, `;
                }
                if (change !== '') {
                    change = change.slice(0, -2);
                    (0, historical_1.saveHistorical)(body.id, idUser, `Modificación`, change);
                }
            }
            const rows = yield db_1.db.query(`UPDATE evento_mob SET telefono_titular_evento = '${body.telefono}', direccion_evento = '${body.direccion}', nombre_titular_evento = '${body.titular}' WHERE id_evento = ${body.id}`);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    data,
                    code,
                };
            }
            return {
                data,
                code,
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 500,
                error: error,
            };
        }
    });
}
function availiable(id, dateArrive) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        let date = dateArrive.split("-");
        if (date[0].length === 2) {
            dateArrive = `${date[2]}-${date[1]}-${date[0]}`;
        }
        const rows = yield db_1.db.query(`
        SELECT 
            inv.id_mob,
            inv.nombre_mob,
            inv.cantidad_mob - COALESCE(SUM(dis.cantidad_rentada), 0) AS cantidad_mob,
            inv.costo_mob as costo_mob,
            inv.extra_mob as extra_mob,
            inv.extra_mob_costo as extra_mob_costo
        FROM 
            inventario_mob inv
        LEFT JOIN 
            (
                SELECT 
                    id_mob,
                    SUM(ocupados) AS cantidad_rentada
                FROM 
                    inventario_disponibilidad_mob
                WHERE 
                    DATE(fecha_evento) = '${dateArrive}'
                GROUP BY 
                    id_mob
            ) dis ON inv.id_mob = dis.id_mob
            WHERE inv.id_empresa = ${id} AND inv.eliminado = 0
        GROUP BY 
            inv.id_mob, inv.nombre_mob
        ORDER BY 
            inv.id_mob;`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        const packages = yield getPackages(id);
        for (const pkt of packages) {
            let up = 99999;
            for (let product of pkt.products) {
                const prd = data.find((item) => item.id_mob === product.fkid_inventario);
                if (prd) {
                    const total = Math.trunc(prd.cantidad_mob / product.cantidad);
                    up = total < up ? total : up;
                }
                product.nombre_mob = prd.nombre_mob;
                product.cantidad_mob = prd.cantidad_mob;
            }
            pkt.availiable = up;
        }
        return {
            data: {
                inventary: data,
                packages,
            },
            code,
        };
    });
}
function getPackages(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db_1.db.query(`SELECT * FROM paquetes WHERE fkid_empresa = ${id} AND eliminado = 0`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            return [];
        }
        for (const pkt of data) {
            const products = yield db_1.db.query(`SELECT * FROM paquete_inventario WHERE fkid_paquete = ${pkt.id}`);
            pkt.products = products;
        }
        return data;
    });
}
function addEvent(body, id, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        if (!body.notifications) {
            body.notifications = {
                send: 0,
                recolected: 0
            };
        }
        let dateEnv = body.evento.fecha_envio_evento.split("-");
        if (dateEnv[0].length === 2) {
            body.evento.fecha_envio_evento = `${dateEnv[2]}-${dateEnv[1]}-${dateEnv[0]}`;
        }
        let dateRec = body.evento.fecha_recoleccion_evento.split("-");
        if (dateRec[0].length === 2) {
            body.evento.fecha_recoleccion_evento = `${dateRec[2]}-${dateRec[1]}-${dateRec[0]}`;
        }
        try {
            const [event] = yield connection.execute(`INSERT INTO evento_mob (nombre_evento, id_empresa, tipo_evento, fecha_envio_evento, hora_envio_evento, fecha_recoleccion_evento, hora_recoleccion_evento, pagado_evento, nombre_titular_evento, direccion_evento ,telefono_titular_evento, descuento, iva, flete, lat, lng, url, id_creador, notificacion_envio, notificacion_recoleccion)
            VALUES ('${body.evento.nombre_evento}',${id}, '${body.evento.tipo_evento}', '${body.evento.fecha_envio_evento}',
                 	'${body.evento.hora_envio_evento}', '${body.evento.fecha_recoleccion_evento}', '${body.evento.hora_recoleccion_evento}',
                 		'${body.evento.pagado_evento}', '${body.evento.nombre_titular_evento}', '${body.evento.direccion_evento}', '${body.evento.telefono_titular_evento}',
                 		${body.evento.descuento}, ${body.evento.ivavalor}, ${body.evento.fletevalor}, '${body.evento.maps.lat}', '${body.evento.maps.lng}', '${body.evento.maps.url}', ${idUsuario}, '${body.notifications.send}', '${body.notifications.recolected}')`);
            for (const mobiliario of body.mobiliario) {
                yield connection.execute(`INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES ('${mobiliario.fecha_evento}', '${mobiliario.hora_evento}', ${mobiliario.id_mob}, ${mobiliario.ocupados},${event.insertId}, '${mobiliario.hora_recoleccion}', ${mobiliario.costo})`);
            }
            if (body.paquetes) {
                for (const paquete of body.paquetes) {
                    yield connection.execute(`INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo, package)
                VALUES ('${body.evento.fecha_envio_evento}', '${body.evento.hora_envio_evento}', ${paquete.id}, ${paquete.cantidad},${event.insertId}, '${body.evento.hora_recoleccion_evento}', ${paquete.precio}, 1)`);
                }
            }
            const [paymenth] = yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${event.insertId},${body.costo.costo_total},${body.costo.saldo},${body.costo.anticipo})`);
            (0, historical_1.saveHistorical)(event.insertId, idUsuario, "Creación");
            if (body.rec && !body.rec) {
                const access_token = yield (0, notifications_1.getAccessToken)();
                (0, notifications_1.sendNotification)(`el dia ${body.evento.fecha_envio_evento}, ${body.mobiliario.length} items rentados`, "Nuevo evento", id, idUsuario, access_token);
            }
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
// Función para enviar notificaciones push
function send(message, title, idCompany) {
    return __awaiter(this, void 0, void 0, function* () {
        const axios = require('axios');
        var admin = require("firebase-admin");
        var serviceAccount = require("../assets/eventivakey.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const rows = yield db_1.db.query(`SELECT token FROM usuarios_mobiliaria WHERE id_empresa = ${idCompany} AND token IS NOT NULL`);
        let tokens = [];
        helper_1.helper.emptyOrRows(rows).forEach((element) => {
            tokens.push(element.token);
        });
        console.log(tokens);
        if (tokens.length === 0) {
            return;
        }
        const payload = {
            registration_ids: tokens,
            notification: {
                title: title,
                body: message
            }
        };
        axios.post('https://fcm.googleapis.com/v1/projects/eventivapp/messages:send', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(0, notifications_1.getAccessToken)()}`
            }
        });
    });
}
function addUrltoEvent(body, id, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            const [event] = yield connection.execute(` UPDATE evento_mob SET url = '${body.url}', lat = '${body.lat}', lng = '${body.lng}' WHERE id_evento = ${id}`);
            (0, historical_1.saveHistorical)(id, idUsuario, "Modificación", `Se actualizo la url ${body.url}`);
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function addFlete(body, id, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            yield connection.execute(`SELECT * FROM evento_mob WHERE id_evento = ${id}`);
            yield connection.execute(` UPDATE evento_mob SET flete = ${body.flete} WHERE id_evento = ${id}`);
            const [payment] = yield connection.execute(`SELECT * FROM pagos_mob WHERE id_evento = ${id}`);
            const costoTotal = payment[payment.length - 1].costo_total + body.flete;
            const saldo = payment[payment.length - 1].saldo + body.flete;
            yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${costoTotal},${saldo},${payment[payment.length - 1].anticipo})`);
            (0, historical_1.saveHistorical)(id, idUsuario, "Modificación", `Se actualizo el flete a ${body.flete}`);
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function addItems(body, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            let [event] = yield connection.execute(`SELECT * FROM evento_mob WHERE id_evento = ${body.id}`);
            event = event[0];
            let sumTotal = 0;
            for (const mobiliario of body.items) {
                sumTotal += mobiliario.cantidad * mobiliario.costo_mob;
                const mobEvent = yield connection.execute(`SELECT * FROM inventario_disponibilidad_mob WHERE id_evento = ${body.id} AND id_mob = ${mobiliario.id_mob}`);
                if (mobEvent[0].length === 0) {
                    yield connection.execute(`INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES ('${event.fecha_envio_evento.toISOString().split("T")[0]}', '${event.hora_envio_evento}', ${mobiliario.id_mob}, ${mobiliario.cantidad}, ${body.id}, '${event.fecha_recoleccion_evento.toISOString().split("T")[0]}', ${mobiliario.costo_mob})`);
                    (0, historical_1.saveHistorical)(body.id, idUsuario, "Modificación", `Se agregó ${mobiliario.cantidad} ${mobiliario.nombre_mob}`);
                }
                else {
                    yield connection.execute(`UPDATE inventario_disponibilidad_mob SET ocupados = ${mobEvent[0][0].ocupados + mobiliario.cantidad} WHERE id_evento = ${body.id} AND id_mob = ${mobiliario.id_mob}`);
                    (0, historical_1.saveHistorical)(body.id, idUsuario, "Modificación", `Se actualizo a ${mobiliario.cantidad} ${mobiliario.nombre_mob}`);
                    continue;
                }
            }
            let [payment] = yield connection.execute(`SELECT * FROM pagos_mob WHERE id_evento = ${body.id}`);
            payment = payment[payment.length - 1];
            let discount = event.descuento;
            let ivavalor = event.iva;
            if (discount > 0) {
                sumTotal = sumTotal - (sumTotal * discount) / 100;
            }
            if (ivavalor === 1) {
                sumTotal = sumTotal + (sumTotal * 16) / 100;
            }
            payment.costo_total += sumTotal;
            payment.saldo += sumTotal;
            yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${body.id},${payment.costo_total},${payment.saldo},${payment.anticipo})`);
            yield connection.execute(`UPDATE evento_mob SET pagado_evento = 0 WHERE id_evento = ${body.id}`);
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function updateObvs(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE evento_mob SET observaciones = '${body.observaciones}'
                WHERE id_evento = ${body.id}`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        return {
            data,
            code,
        };
    });
}
function changeStatus(id, delivered, recolected, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE evento_mob SET entregado = '${delivered}', recolectado = '${recolected}'
                WHERE id_evento = ${id}`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code,
            };
        }
        (0, historical_1.saveHistorical)(id, idUsuario, "Modificación", `Se actualizó el estado a entregado: ${delivered} y recolectado: ${recolected}`);
        return {
            data,
            code,
        };
    });
}
function remove(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            let [event] = yield connection.execute(`DELETE FROM evento_mob WHERE id_evento = ${id}`);
            let [disponility] = yield connection.execute(`DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id}`);
            yield connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
function removeItem(id, id_mob) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            let item = yield connection.execute(`SELECT * FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`);
            ///function for obtains discont of event
            let event = yield connection.execute(`SELECT descuento, iva FROM evento_mob WHERE id_evento = ${id}`);
            let discount = event[0][0].descuento;
            let iva = event[0][0].iva;
            item = item[0][0];
            let priceRemove = item.costo * item.ocupados;
            let removePayment = yield connection.execute(`SELECT * FROM pagos_mob WHERE id_evento = ${id}`);
            removePayment = removePayment[0][removePayment[0].length - 1];
            if (discount > 0) {
                priceRemove = priceRemove - (priceRemove * discount) / 100;
            }
            if (iva === 1) {
                priceRemove = priceRemove + (priceRemove * 16) / 100;
            }
            removePayment.costo_total -= priceRemove;
            removePayment.saldo -= priceRemove;
            yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${removePayment.costo_total},${removePayment.saldo},${removePayment.anticipo})`);
            yield connection.execute(`DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`);
            yield (0, historical_1.saveHistorical)(id, 1, "Modificación", `Se eliminó ${item.ocupados} ${item.nombre_mob ? item.nombre_mob : item.nombre}`);
            connection.commit();
            return 201;
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
            return 405;
        }
    });
}
module.exports = {
    getEvents,
    getEventsOfDay,
    availiable,
    addEvent,
    updateObvs,
    getDetails,
    changeStatus,
    remove,
    removeItem,
    editEvent,
    addItems,
    addUrltoEvent,
    addFlete,
    sendNotification: notifications_1.sendNotification
};
