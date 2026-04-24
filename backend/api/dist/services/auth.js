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
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const REFRESH_TOKEN_BYTES = 48;
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}
function getRefreshExpiryDate() {
    const ttlDays = config_1.config.jwtRefreshExpiresInDays;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    return expiresAt;
}
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
      WHERE correo = ? AND contrasena = ?`, [body.email, body.password]);
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
function createRefreshSession(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(refreshToken);
        const expiresAt = getRefreshExpiryDate();
        yield db_1.db.query(`INSERT INTO auth_refresh_tokens (id_usuario, token_hash, expires_at)
         VALUES (?, ?, ?)`, [userId, refreshTokenHash, expiresAt]);
        return refreshToken;
    });
}
function rotateRefreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!refreshToken) {
            return { code: 400, message: 'refresh token requerido' };
        }
        let code = 200;
        const currentHash = hashToken(refreshToken);
        const rows = yield db_1.db.query(`SELECT id, id_usuario, expires_at, revoked_at
         FROM auth_refresh_tokens
         WHERE token_hash = ?
         LIMIT 1`, [currentHash]);
        const matches = helper_1.helper.emptyOrRows(rows);
        if (matches.length === 0) {
            return { code: 401, message: 'refresh token invalido' };
        }
        const current = matches[0];
        const now = new Date();
        if (current.revoked_at || new Date(current.expires_at) <= now) {
            return { code: 401, message: 'refresh token expirado' };
        }
        const nextRefreshToken = generateRefreshToken();
        const nextHash = hashToken(nextRefreshToken);
        const nextExpiresAt = getRefreshExpiryDate();
        const conn = yield db_1.db.connection();
        try {
            yield conn.beginTransaction();
            const [insertResult] = yield conn.execute(`INSERT INTO auth_refresh_tokens (id_usuario, token_hash, expires_at)
             VALUES (?, ?, ?)`, [current.id_usuario, nextHash, nextExpiresAt]);
            yield conn.execute(`UPDATE auth_refresh_tokens
             SET revoked_at = NOW(), replaced_by = ?
             WHERE id = ?`, [insertResult.insertId, current.id]);
            yield conn.commit();
        }
        catch (error) {
            yield conn.rollback();
            throw error;
        }
        finally {
            conn.release();
        }
        const userRows = yield db_1.db.query(`SELECT * FROM usuarios_mobiliaria WHERE id_usuario = ? LIMIT 1`, [current.id_usuario]);
        const users = helper_1.helper.emptyOrRows(userRows);
        if (users.length === 0) {
            code = 404;
            return { code, message: 'usuario no encontrado' };
        }
        return {
            code,
            data: users[0],
            refreshToken: nextRefreshToken,
        };
    });
}
function revokeRefreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!refreshToken) {
            return { code: 200 };
        }
        const refreshTokenHash = hashToken(refreshToken);
        yield db_1.db.query(`UPDATE auth_refresh_tokens
         SET revoked_at = NOW()
         WHERE token_hash = ? AND revoked_at IS NULL`, [refreshTokenHash]);
        return { code: 200 };
    });
}
function token(body) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = 200;
        const rows = yield db_1.db.query(`UPDATE usuarios_mobiliaria SET token = ? WHERE id_usuario = ?;`, [body.token, body.id]);
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
    createRefreshSession,
    rotateRefreshToken,
    revokeRefreshToken,
    token,
    loginForId,
    resetPassword,
    changeAccountStatus
};
