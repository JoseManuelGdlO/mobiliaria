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
exports.saveHistorical = saveHistorical;
const db_1 = require("../services/db");
function saveHistorical(idEvent, idUser, description, obs) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield db_1.db.connection();
        yield connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        yield connection.beginTransaction();
        try {
            yield connection.execute(`INSERT INTO historical (date, description, obs, fkid_user, fkid_event)
              VALUES ('${new Date().toISOString()}', '${description}', '${obs}', ${idUser}, ${idEvent})`);
            connection.commit();
        }
        catch (error) {
            console.error(error);
            connection.rollback();
            console.info("Rollback successful");
        }
    });
}
