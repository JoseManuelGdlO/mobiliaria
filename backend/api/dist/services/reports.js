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
        var _a, _b;
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
            total += Number((event === null || event === void 0 ? void 0 : event.costo_total) || 0);
            index++;
        }
        const average = index > 0 ? total / index : 0;
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
        const salesRows = yield db_1.db.query(`SELECT 
            COUNT(DISTINCT em.id_evento) AS total_events,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 1 THEN 1 ELSE 0 END), 0) AS paid_events,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 0 THEN 1 ELSE 0 END), 0) AS pending_events,
            COALESCE(SUM(pm.costo_total), 0) AS total_income,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 0 THEN pm.saldo ELSE 0 END), 0) AS pending_balance_total
        FROM evento_mob AS em
        LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
        WHERE
            em.id_empresa = ${id} AND
            em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)`);
        const topClientsRows = yield db_1.db.query(`SELECT 
            em.nombre_titular_evento AS client_name,
            COUNT(DISTINCT em.id_evento) AS total_events,
            COALESCE(SUM(pm.costo_total), 0) AS total_income
        FROM evento_mob AS em
        LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
        WHERE
            em.id_empresa = ${id} AND
            em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
        GROUP BY em.nombre_titular_evento
        ORDER BY total_income DESC
        LIMIT 5`);
        const recurrentClientsRows = yield db_1.db.query(`SELECT COUNT(*) AS recurrent_clients
        FROM (
            SELECT em.nombre_titular_evento
            FROM evento_mob AS em
            WHERE
                em.id_empresa = ${id} AND
                em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
            GROUP BY em.nombre_titular_evento
            HAVING COUNT(DISTINCT em.id_evento) >= 2
        ) AS recurrent_data`);
        const topEventTypesRows = yield db_1.db.query(`SELECT
            em.tipo_evento AS event_type,
            COUNT(DISTINCT em.id_evento) AS total_events,
            COALESCE(SUM(pm.costo_total), 0) AS total_income
        FROM evento_mob AS em
        LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
        WHERE
            em.id_empresa = ${id} AND
            em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
        GROUP BY em.tipo_evento
        ORDER BY total_income DESC
        LIMIT 5`);
        const sales = ((_a = helper_1.helper.emptyOrRows(salesRows)) === null || _a === void 0 ? void 0 : _a[0]) || {};
        const totalEvents = Number(sales.total_events || 0);
        const paidEvents = Number(sales.paid_events || 0);
        const pendingEvents = Number(sales.pending_events || 0);
        const totalIncome = Number(sales.total_income || 0);
        const pendingBalanceTotal = Number(sales.pending_balance_total || 0);
        const paymentRate = totalEvents > 0 ? (paidEvents / totalEvents) * 100 : 0;
        const avgTicket = totalEvents > 0 ? totalIncome / totalEvents : 0;
        return {
            data: {
                mostRent,
                eventos: {
                    total: Number(total.toFixed(2)),
                    numero_eventos: index,
                    promedio: Number(average.toFixed(2))
                },
                Quantity,
                salesKpis: {
                    total_events: totalEvents,
                    paid_events: paidEvents,
                    pending_events: pendingEvents,
                    payment_rate: Number(paymentRate.toFixed(2)),
                    total_income: Number(totalIncome.toFixed(2)),
                    avg_ticket: Number(avgTicket.toFixed(2)),
                    pending_balance_total: Number(pendingBalanceTotal.toFixed(2)),
                    recurrent_clients: Number(((_b = recurrentClientsRows === null || recurrentClientsRows === void 0 ? void 0 : recurrentClientsRows[0]) === null || _b === void 0 ? void 0 : _b.recurrent_clients) || 0),
                    top_clients_by_revenue: helper_1.helper.emptyOrRows(topClientsRows),
                    top_event_types: helper_1.helper.emptyOrRows(topEventTypesRows),
                }
            },
            code
        };
    });
}
function getAggregateByWhere(id, whereDateSql, dateParams) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const params = [id, ...dateParams];
        const incomeRows = yield db_1.db.query(`SELECT COALESCE(SUM(pm.costo_total), 0) AS income_total
         FROM evento_mob AS em
         LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
         WHERE em.id_empresa = ?
           AND ${whereDateSql}`, params);
        const expenseRows = yield db_1.db.query(`SELECT COALESCE(SUM(gm.monto), 0) AS expenses_total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}`, params);
        const byCategory = yield db_1.db.query(`SELECT gm.categoria, COALESCE(SUM(gm.monto), 0) AS total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}
         GROUP BY gm.categoria
         ORDER BY total DESC`, params);
        const byType = yield db_1.db.query(`SELECT gm.tipo, COALESCE(SUM(gm.monto), 0) AS total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}
         GROUP BY gm.tipo
         ORDER BY total DESC`, params);
        const incomeTotal = Number(((_a = incomeRows === null || incomeRows === void 0 ? void 0 : incomeRows[0]) === null || _a === void 0 ? void 0 : _a.income_total) || 0);
        const expensesTotal = Number(((_b = expenseRows === null || expenseRows === void 0 ? void 0 : expenseRows[0]) === null || _b === void 0 ? void 0 : _b.expenses_total) || 0);
        return {
            income_total: incomeTotal,
            expenses_total: expensesTotal,
            balance: incomeTotal - expensesTotal,
            breakdown: {
                by_category: helper_1.helper.emptyOrRows(byCategory),
                by_type: helper_1.helper.emptyOrRows(byType),
            },
        };
    });
}
function getFinancialSummary(id, months, period, month, year, compareMonth, compareYear) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const parsedMonths = Number(months);
        const safeMonths = Number.isFinite(parsedMonths) && parsedMonths > 0 ? Math.floor(parsedMonths) : 1;
        const normalizedPeriod = typeof period === 'string' ? period.trim().toLowerCase() : '';
        const useCurrentMonth = normalizedPeriod === 'current_month';
        const usePreviousMonth = normalizedPeriod === 'previous_month';
        const parsedMonth = Number(month);
        const parsedYear = Number(year);
        const hasCustomMonth = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 && Number.isFinite(parsedYear) && parsedYear >= 2000;
        let whereDateSql = 'em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)';
        let whereDateParams = [safeMonths];
        let selectedMonth = parsedMonth;
        let selectedYear = parsedYear;
        if (hasCustomMonth) {
            whereDateSql = 'YEAR(em.fecha_envio_evento) = ? AND MONTH(em.fecha_envio_evento) = ?';
            whereDateParams = [parsedYear, parsedMonth];
        }
        else if (useCurrentMonth) {
            whereDateSql = 'em.fecha_envio_evento >= DATE_FORMAT(CURDATE(), "%Y-%m-01")';
            whereDateParams = [];
            const now = new Date();
            selectedMonth = now.getMonth() + 1;
            selectedYear = now.getFullYear();
        }
        else if (usePreviousMonth) {
            whereDateSql = 'YEAR(em.fecha_envio_evento) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(em.fecha_envio_evento) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))';
            whereDateParams = [];
            const previous = new Date();
            previous.setMonth(previous.getMonth() - 1);
            selectedMonth = previous.getMonth() + 1;
            selectedYear = previous.getFullYear();
        }
        const currentAggregate = yield getAggregateByWhere(id, whereDateSql, whereDateParams);
        const parsedCompareMonth = Number(compareMonth);
        const parsedCompareYear = Number(compareYear || selectedYear);
        const hasComparison = Number.isFinite(parsedCompareMonth) && parsedCompareMonth >= 1 && parsedCompareMonth <= 12 && Number.isFinite(parsedCompareYear) && parsedCompareYear >= 2000;
        let compareData = null;
        let delta = null;
        if (hasComparison) {
            const compareAggregate = yield getAggregateByWhere(id, 'YEAR(em.fecha_envio_evento) = ? AND MONTH(em.fecha_envio_evento) = ?', [parsedCompareYear, parsedCompareMonth]);
            compareData = Object.assign({ month: parsedCompareMonth, year: parsedCompareYear }, compareAggregate);
            delta = {
                income_total: Number((currentAggregate.income_total - compareAggregate.income_total).toFixed(2)),
                expenses_total: Number((currentAggregate.expenses_total - compareAggregate.expenses_total).toFixed(2)),
                balance: Number((currentAggregate.balance - compareAggregate.balance).toFixed(2)),
            };
        }
        return {
            data: {
                income_total: currentAggregate.income_total,
                expenses_total: currentAggregate.expenses_total,
                balance: currentAggregate.balance,
                breakdown: currentAggregate.breakdown,
                months: safeMonths,
                period: useCurrentMonth ? 'current_month' : usePreviousMonth ? 'previous_month' : 'rolling_months',
                month: Number.isFinite(selectedMonth) ? selectedMonth : null,
                year: Number.isFinite(selectedYear) ? selectedYear : null,
                compare: compareData,
                delta,
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
    getFinancialSummary,
    runCron
};
