import { db } from './db';
import { helper } from '../helper';
import moment from 'moment';
import { getAccessToken, sendNotification } from '../libs/notifications';

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
    console.log('rows2', rows2.length, rows2);

    let totalCost = helper.emptyOrRows(rows2);

    let total = 0
    let index = 0

    for (const event of totalCost) {
        total += Number(event?.costo_total || 0)
        index++
    }

    const average = index > 0 ? total / index : 0;

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

    const salesRows: any = await db.query(
        `SELECT 
            COUNT(DISTINCT em.id_evento) AS total_events,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 1 THEN 1 ELSE 0 END), 0) AS paid_events,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 0 THEN 1 ELSE 0 END), 0) AS pending_events,
            COALESCE(SUM(pm.costo_total), 0) AS total_income,
            COALESCE(SUM(CASE WHEN em.pagado_evento = 0 THEN pm.saldo ELSE 0 END), 0) AS pending_balance_total
        FROM evento_mob AS em
        LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
        WHERE
            em.id_empresa = ${id} AND
            em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)`
    );

    const topClientsRows: any = await db.query(
        `SELECT 
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
        LIMIT 5`
    );

    const recurrentClientsRows: any = await db.query(
        `SELECT COUNT(*) AS recurrent_clients
        FROM (
            SELECT em.nombre_titular_evento
            FROM evento_mob AS em
            WHERE
                em.id_empresa = ${id} AND
                em.fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
            GROUP BY em.nombre_titular_evento
            HAVING COUNT(DISTINCT em.id_evento) >= 2
        ) AS recurrent_data`
    );

    const topEventTypesRows: any = await db.query(
        `SELECT
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
        LIMIT 5`
    );

    const sales = helper.emptyOrRows(salesRows)?.[0] || {};
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
                recurrent_clients: Number(recurrentClientsRows?.[0]?.recurrent_clients || 0),
                top_clients_by_revenue: helper.emptyOrRows(topClientsRows),
                top_event_types: helper.emptyOrRows(topEventTypesRows),
            }
        },
        code
    }
}

interface FinancialAggregate {
    income_total: number;
    expenses_total: number;
    balance: number;
    breakdown: {
        by_category: any[];
        by_type: any[];
    };
}

async function getAggregateByWhere(id: number, whereDateSql: string, dateParams: any[]): Promise<FinancialAggregate> {
    const params = [id, ...dateParams];

    const incomeRows: any = await db.query(
        `SELECT COALESCE(SUM(pm.costo_total), 0) AS income_total
         FROM evento_mob AS em
         LEFT JOIN pagos_mob AS pm ON em.id_evento = pm.id_evento
         WHERE em.id_empresa = ?
           AND ${whereDateSql}`,
        params
    );

    const expenseRows: any = await db.query(
        `SELECT COALESCE(SUM(gm.monto), 0) AS expenses_total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}`,
        params
    );

    const byCategory: any = await db.query(
        `SELECT gm.categoria, COALESCE(SUM(gm.monto), 0) AS total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}
         GROUP BY gm.categoria
         ORDER BY total DESC`,
        params
    );

    const byType: any = await db.query(
        `SELECT gm.tipo, COALESCE(SUM(gm.monto), 0) AS total
         FROM gastos_mob AS gm
         WHERE gm.id_empresa = ?
           AND gm.status = 'activo'
           AND ${whereDateSql.replace(/em\.fecha_envio_evento/g, 'gm.fecha')}
         GROUP BY gm.tipo
         ORDER BY total DESC`,
        params
    );

    const incomeTotal = Number(incomeRows?.[0]?.income_total || 0);
    const expensesTotal = Number(expenseRows?.[0]?.expenses_total || 0);

    return {
        income_total: incomeTotal,
        expenses_total: expensesTotal,
        balance: incomeTotal - expensesTotal,
        breakdown: {
            by_category: helper.emptyOrRows(byCategory),
            by_type: helper.emptyOrRows(byType),
        },
    };
}

async function getFinancialSummary(
    id: number,
    months: string,
    period?: string,
    month?: string,
    year?: string,
    compareMonth?: string,
    compareYear?: string
) {
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
    let whereDateParams: any[] = [safeMonths];
    let selectedMonth = parsedMonth;
    let selectedYear = parsedYear;

    if (hasCustomMonth) {
        whereDateSql = 'YEAR(em.fecha_envio_evento) = ? AND MONTH(em.fecha_envio_evento) = ?';
        whereDateParams = [parsedYear, parsedMonth];
    } else if (useCurrentMonth) {
        whereDateSql = 'em.fecha_envio_evento >= DATE_FORMAT(CURDATE(), "%Y-%m-01")';
        whereDateParams = [];
        const now = new Date();
        selectedMonth = now.getMonth() + 1;
        selectedYear = now.getFullYear();
    } else if (usePreviousMonth) {
        whereDateSql = 'YEAR(em.fecha_envio_evento) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(em.fecha_envio_evento) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))';
        whereDateParams = [];
        const previous = new Date();
        previous.setMonth(previous.getMonth() - 1);
        selectedMonth = previous.getMonth() + 1;
        selectedYear = previous.getFullYear();
    }

    const currentAggregate = await getAggregateByWhere(id, whereDateSql, whereDateParams);

    const parsedCompareMonth = Number(compareMonth);
    const parsedCompareYear = Number(compareYear || selectedYear);
    const hasComparison = Number.isFinite(parsedCompareMonth) && parsedCompareMonth >= 1 && parsedCompareMonth <= 12 && Number.isFinite(parsedCompareYear) && parsedCompareYear >= 2000;

    let compareData = null;
    let delta = null;
    if (hasComparison) {
        const compareAggregate = await getAggregateByWhere(
            id,
            'YEAR(em.fecha_envio_evento) = ? AND MONTH(em.fecha_envio_evento) = ?',
            [parsedCompareYear, parsedCompareMonth]
        );
        compareData = {
            month: parsedCompareMonth,
            year: parsedCompareYear,
            ...compareAggregate,
        };
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
    }
}

async function runCron() {
    const now = moment(/*'2024-08-28 13:00:00', 'YYYY-MM-DD HH:mm:ss'*/);

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
        const results = await db.query(query, [now.format('YYYY-MM-DD'), now.format('YYYY-MM-DD')])
        let access_token = await getAccessToken();     

        results.forEach(async (event: any) => {
            // Si la notificación de envío no está desactivada, procesarla
            if (event.notificacion_envio_enviada === 0 && event.notificacion_envio && event.notificacion_envio !== '0') {
                const envioNotificationTime = calculateNotificationTime(event.fecha_envio_evento, event.hora_envio_evento, event.notificacion_envio);
                
                if (now.isSameOrAfter(envioNotificationTime)) {
                    // Aquí iría el código para notificar sobre el envío
                    const updateQuery = `UPDATE evento_mob SET notificacion_envio_enviada = TRUE WHERE id_evento = ${event.id_evento}`;
                    await db.query(updateQuery)
                    sendNotification(`Falta ${convertNombeclatureToString(event.notificacion_envio)}, El evento de ${event.nombre_titular_evento} esta proximo`, 'Envio proximo', event.id_empresa, event.id_usuario, access_token);
                }
            }

            // Si la notificación de recolección no está desactivada, procesarla
            if (event.notificacion_recoleccion_enviada === 0 && event.notificacion_recoleccion && event.notificacion_recoleccion !== '0') {
                const recoleccionNotificationTime = calculateNotificationTime(event.fecha_recoleccion_evento, event.hora_recoleccion_evento, event.notificacion_recoleccion);
                if (now.isSameOrAfter(recoleccionNotificationTime)) {
                    // Aquí iría el código para notificar sobre la recolección
                    const updateQuery = `UPDATE evento_mob SET notificacion_recoleccion_enviada = TRUE WHERE id_evento = ${event.id_evento}`;
                    await db.query(updateQuery)
                    sendNotification(`Falta ${convertNombeclatureToString(event.notificacion_recoleccion)}, Tenemos que recoger meterial del evento de ${event.nombre_titular_evento}`, 'Recoleccion cerca', event.id_empresa, event.id_usuario, access_token);
                }
            }
        });

    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        return;
    }


};

// Función para calcular el tiempo de notificación basado en el formato (1h, 1d, 1s, etc.)
function calculateNotificationTime(fecha: Date, hora: any, notificacion: any) {
    
    const dateTime = moment(`${fecha.toISOString().split('T')[0]} ${hora}`, 'YYYY-MM-DD HH:mm:ss');
    
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

function convertNombeclatureToString(notificacion: string) {
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
}