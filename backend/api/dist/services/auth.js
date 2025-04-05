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
function register(body) {
    return __awaiter(this, void 0, void 0, function* () {
        // body.password = await encrypt.encryptPassword(body.password);
        console.log(body);
        const rows = yield db_1.db.query(`INSERT INTO usuario (nombres, apellidos, email, password, ruta_fotografia, idTipoUsuario, idUniversidad, idFechaEnarm, idEspecialidad, cumpleanos, sexo, id_social_media)
    VALUES ("${body.nombres}", "${body.apellidos}", "${body.email}", "${body.password}", "${body.ruta_fotografia}", "${body.idTipoUsuario}", "${body.idUniversidad}", "${body.idFechaEnarm}", "${body.idEspecialidad}", "${body.cumpleanos}", "${body.sexo}", "${body.id_social_media}");`);
        const data = helper_1.helper.emptyOrRows(rows);
        const exist = yield db_1.db.query(`select * from account_estatus WHERE idUsuario = ${data.insertId};`);
        const flagExist = helper_1.helper.emptyOrRows(exist).length !== 0;
        if (flagExist) {
            yield db_1.db.query(`UPDATE account_estatus SET estatus = 0 WHERE idUsuario = ${data.insertId};`);
        }
        else {
            yield db_1.db.query(`INSERT INTO account_estatus (idUsuario, estatus) VALUES (${data.insertId}, 0);`);
        }
        return {
            data
        };
    });
}
function login(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`SELECT * FROM usuarios_mobiliaria
      WHERE correo = "${body.email}" AND contrasena = "${body.password}"`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code
            };
        }
        data = data[0];
        return {
            data,
            code
        };
    });
}
function token(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET token = '${body.token}' WHERE id_usuario = ${body.id};`);
        let data = helper_1.helper.emptyOrRows(rows);
        if (data.length === 0) {
            code = 404;
            return {
                data,
                code
            };
        }
        data = data[0];
        return {
            data,
            code
        };
    });
}
function loginForId(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const finds = yield db_1.db.query(`SELECT * FROM usuario
      WHERE email = "${body.email}"`);
        let user = helper_1.helper.emptyOrRows(finds);
        if (user.length === 0) {
            code = 404;
            return {
                user,
                code
            };
        }
        if (user[0].id_social_media.length === 0) {
            yield db_1.db.query(`UPDATE usuario
          set id_social_media = ${body.id} WHERE id = "${user[0].id}"`);
        }
        const account = yield db_1.db.query(`SELECT * FROM account_estatus
      WHERE idUsuario = "${user[0].id}"`);
        const data = { data: user[0], account: account[0] };
        return {
            data,
            code
        };
    });
}
function changeAccountStatus(body) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(body);
        const rows = yield db_1.db.query(`UPDATE account_estatus
        set estatus = ${body.status} WHERE idUsuario = ${body.id}`);
        const data = helper_1.helper.emptyOrRows(rows);
        return {
            data
        };
    });
}
function resetPassword(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const randomstring = Math.random().toString(36).slice(-12);
        yield db_1.db.query(`UPDATE usuario
        set password = '${randomstring}' WHERE id = ${id}`);
        return {
            randomstring
        };
    });
}
module.exports = {
    register,
    login,
    token,
    loginForId,
    resetPassword,
    changeAccountStatus
};
