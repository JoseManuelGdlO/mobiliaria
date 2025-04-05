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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const helper_1 = require("../helper");
const moment_1 = __importDefault(require("moment"));
const notifications_1 = require("../libs/notifications");
function getReports(id, months) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        console.log('moths', months);
        const rows = yield db_1.db.query(`SELECT 
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
        LIMIT 10;`);
        let mostRent = helper_1.helper.emptyOrRows(rows);
        const rows2 = yield db_1.db.query(`SELECT 
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
            em.id_evento, em.nombre_evento;`);
        console.log('rows2', rows2.length, rows2);
        let totalCost = helper_1.helper.emptyOrRows(rows2);
        let total = 0;
        let index = 0;
        for (const event of totalCost) {
            total += event.costo_total;
            index++;
        }
        console.log(total, index);
        const rows3 = yield db_1.db.query(`SELECT 
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
        LIMIT 10;`);
        let Quantity = helper_1.helper.emptyOrRows(rows3);
        return {
            data: {
                mostRent,
                eventos: {
                    total: total,
                    numero_eventos: index,
                    promedio: total / index
                },
                Quantity
            },
            code
        };
    });
}
function runCron() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = (0, moment_1.default)( /*'2024-08-28 13:00:00', 'YYYY-MM-DD HH:mm:ss'*/);
        // Consulta SQL para buscar eventos desde hoy en adelante
        const query = `
      SELECT * FROM evento_mob 
      WHERE 
        (fecha_envio_evento >= ? OR fecha_recoleccion_evento >= ?)
        AND
        (notificacion_envio IS NOT NULL OR notificacion_recoleccion IS NOT NULL)
        AND
        (notificacion_envio != 'null' OR notificacion_recoleccion != 'null')
        AND
        (notificacion_envio != 0 OR notificacion_recoleccion != 0)
    `;
        try {
            const results = yield db_1.db.query(query, [now.format('YYYY-MM-DD'), now.format('YYYY-MM-DD')]);
            let access_token = yield (0, notifications_1.getAccessToken)();
            results.forEach((event) => __awaiter(this, void 0, void 0, function* () {
                // Si la notificación de envío no está desactivada, procesarla
                if (event.notificacion_envio_enviada === 0 && event.notificacion_envio && event.notificacion_envio !== '0') {
                    const envioNotificationTime = calculateNotificationTime(event.fecha_envio_evento, event.hora_envio_evento, event.notificacion_envio);
                    if (now.isSameOrAfter(envioNotificationTime)) {
                        // Aquí iría el código para notificar sobre el envío
                        const updateQuery = `UPDATE evento_mob SET notificacion_envio_enviada = TRUE WHERE id_evento = ${event.id_evento}`;
                        yield db_1.db.query(updateQuery);
                        (0, notifications_1.sendNotification)(`Falta ${convertNombeclatureToString(event.notificacion_envio)}, El evento de ${event.nombre_titular_evento} esta proximo`, 'Envio proximo', event.id_empresa, event.id_usuario, access_token);
                    }
                }
                // Si la notificación de recolección no está desactivada, procesarla
                if (event.notificacion_recoleccion_enviada === 0 && event.notificacion_recoleccion && event.notificacion_recoleccion !== '0') {
                    const recoleccionNotificationTime = calculateNotificationTime(event.fecha_recoleccion_evento, event.hora_recoleccion_evento, event.notificacion_recoleccion);
                    if (now.isSameOrAfter(recoleccionNotificationTime)) {
                        // Aquí iría el código para notificar sobre la recolección
                        const updateQuery = `UPDATE evento_mob SET notificacion_recoleccion_enviada = TRUE WHERE id_evento = ${event.id_evento}`;
                        yield db_1.db.query(updateQuery);
                        (0, notifications_1.sendNotification)(`Falta ${convertNombeclatureToString(event.notificacion_recoleccion)}, Tenemos que recoger meterial del evento de ${event.nombre_titular_evento}`, 'Recoleccion cerca', event.id_empresa, event.id_usuario, access_token);
                    }
                }
            }));
        }
        catch (error) {
            console.error('Error al consultar la base de datos:', error);
            return;
        }
    });
}
;
// Función para calcular el tiempo de notificación basado en el formato (1h, 1d, 1s, etc.)
function calculateNotificationTime(fecha, hora, notificacion) {
    const dateTime = (0, moment_1.default)(`${fecha.toISOString().split('T')[0]} ${hora}`, 'YYYY-MM-DD HH:mm:ss');
    // Extrae el valor numérico y la unidad de la notificación (por ejemplo, 1h -> 1 y h)
    const value = parseInt(notificacion.slice(0, -1));
    const unit = notificacion.slice(-1);
    // Resta el tiempo de notificación según la unidad
    switch (unit) {
        case 'h':
            return dateTime.subtract(value, 'hours');
        case 'd':
            return dateTime.subtract(value, 'days');
        case 's':
            return dateTime.subtract(value, 'weeks');
        default:
            return dateTime;
    }
}
function convertNombeclatureToString(notificacion) {
    // Extrae el valor numérico y la unidad de la notificación (por ejemplo, 1h -> 1 y h)
    const value = parseInt(notificacion.slice(0, -1));
    const unit = notificacion.slice(-1);
    switch (unit) {
        case 'h':
            return value + ' horas';
        case 'd':
            return value + ' dias';
        case 's':
            return value + ' semanas';
        default:
            return 'hours';
    }
}
module.exports = {
    getReports,
    runCron
};
