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
function getPayments(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`SELECT *
        FROM evento_mob
        LEFT JOIN pagos_mob
        ON evento_mob.id_evento = pagos_mob.id_evento
        WHERE fecha_envio_evento LIKE '%202%'
        AND evento_mob.id_empresa = ${id}
        ORDER BY evento_mob.fecha_envio_evento;`);
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
function addPayment(body, idUsuario) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const connection = yield db_1.db.connection();
        yield connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        yield connection.beginTransaction();
        try {
            const rows = yield connection.execute(`INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo, fecha, abono ) VALUE
            (${body.id_evento}, ${body.total}, ${body.saldo}, ${body.anticipo}, '${new Date().toISOString().split('T')[0]}', ${body.abono})`);
            (0, historical_1.saveHistorical)(body.id_evento, idUsuario, 'Abono', body.abono);
            let data = helper_1.helper.emptyOrRows(rows);
            if (data.length === 0) {
                code = 404;
                return {
                    data,
                    code
                };
            }
            if (body.saldo === 0) {
                yield connection.execute(`UPDATE evento_mob SET pagado_evento = '1' WHERE id_evento = ${body.id_evento}`);
            }
            yield connection.commit();
            return {
                data,
                code
            };
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info('Rollback successful');
            return {
                data: error,
                code: 405
            };
        }
    });
}
module.exports = {
    getPayments,
    addPayment
};
