import { db } from './db';
import { helper } from '../helper';
import { encrypt } from '../libs/encrypt';
import crypto from 'crypto';
import { config } from '../config';

const REFRESH_TOKEN_BYTES = 48;

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

function getRefreshExpiryDate() {
    const ttlDays = config.jwtRefreshExpiresInDays;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    return expiresAt;
}

async function register(body: any) {
    // body.password = await encrypt.encryptPassword(body.password);
    console.log(body);
    const rows = await db.query(
        `INSERT INTO usuario (nombres, apellidos, email, password, ruta_fotografia, idTipoUsuario, idUniversidad, idFechaEnarm, idEspecialidad, cumpleanos, sexo, id_social_media)
    VALUES ("${body.nombres}", "${body.apellidos}", "${body.email}", "${body.password}", "${body.ruta_fotografia}", "${body.idTipoUsuario}", "${body.idUniversidad}", "${body.idFechaEnarm}", "${body.idEspecialidad}", "${body.cumpleanos}", "${body.sexo}", "${body.id_social_media}");`
    );
    const data = helper.emptyOrRows(rows);

    const exist = await db.query(
        `select * from account_estatus WHERE idUsuario = ${data.insertId};`
    );

    const flagExist = helper.emptyOrRows(exist).length !== 0;

    if (flagExist) {
        await db.query(
            `UPDATE account_estatus SET estatus = 0 WHERE idUsuario = ${data.insertId};`
        );
    } else {
        await db.query(
            `INSERT INTO account_estatus (idUsuario, estatus) VALUES (${data.insertId}, 0);`
        );
    }
    return {
        data
    }
}

async function login(body: any) {
    let code = 200;
    const rows = await db.query(
        `SELECT * FROM usuarios_mobiliaria
      WHERE correo = ? AND contrasena = ?`,
      [body.email, body.password]
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    data = data[0]


    return {
        data,
        code
    }
}

async function createRefreshSession(userId: number) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = getRefreshExpiryDate();

    await db.query(
        `INSERT INTO auth_refresh_tokens (id_usuario, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [userId, refreshTokenHash, expiresAt]
    );

    return refreshToken;
}

async function rotateRefreshToken(refreshToken: string) {
    if (!refreshToken) {
        return { code: 400, message: 'refresh token requerido' };
    }
    let code = 200;
    const currentHash = hashToken(refreshToken);
    const rows = await db.query(
        `SELECT id, id_usuario, expires_at, revoked_at
         FROM auth_refresh_tokens
         WHERE token_hash = ?
         LIMIT 1`,
        [currentHash]
    );

    const matches = helper.emptyOrRows(rows);
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

    const conn = await db.connection();
    try {
        await conn.beginTransaction();
        const [insertResult]: any = await conn.execute(
            `INSERT INTO auth_refresh_tokens (id_usuario, token_hash, expires_at)
             VALUES (?, ?, ?)`,
            [current.id_usuario, nextHash, nextExpiresAt]
        );
        await conn.execute(
            `UPDATE auth_refresh_tokens
             SET revoked_at = NOW(), replaced_by = ?
             WHERE id = ?`,
            [insertResult.insertId, current.id]
        );
        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }

    const userRows = await db.query(
        `SELECT * FROM usuarios_mobiliaria WHERE id_usuario = ? LIMIT 1`,
        [current.id_usuario]
    );
    const users = helper.emptyOrRows(userRows);
    if (users.length === 0) {
        code = 404;
        return { code, message: 'usuario no encontrado' };
    }

    return {
        code,
        data: users[0],
        refreshToken: nextRefreshToken,
    };
}

async function revokeRefreshToken(refreshToken: string) {
    if (!refreshToken) {
        return { code: 200 };
    }
    const refreshTokenHash = hashToken(refreshToken);
    await db.query(
        `UPDATE auth_refresh_tokens
         SET revoked_at = NOW()
         WHERE token_hash = ? AND revoked_at IS NULL`,
        [refreshTokenHash]
    );

    return { code: 200 };
}

async function token(body: any) {
    let code = 200;
    
    const rows = await db.query(
        `UPDATE usuarios_mobiliaria SET token = ? WHERE id_usuario = ?;`,
        [body.token, body.id]
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
        code = 404;
        return {
            data,
            code
        }
    }

    data = data[0]


    return {
        data,
        code
    }
}

async function loginForId(body: any) {
    let code = 200;
    const finds = await db.query(
        `SELECT * FROM usuario
      WHERE email = "${body.email}"`
    );

    let user = helper.emptyOrRows(finds);
    if (user.length === 0) {
        code = 404;
        return {
            user,
            code
        }
    }

    if (user[0].id_social_media.length === 0) {
        await db.query(
            `UPDATE usuario
          set id_social_media = ${body.id} WHERE id = "${user[0].id}"`
        );
    }


    const account = await db.query(
        `SELECT * FROM account_estatus
      WHERE idUsuario = "${user[0].id}"`
    );
    const data = { data: user[0], account: account[0] }


    return {
        data,
        code
    }
}

async function changeAccountStatus(body: any) {
    console.log(body);
    const rows = await db.query(
        `UPDATE account_estatus
        set estatus = ${body.status} WHERE idUsuario = ${body.id}`
    );
    const data = helper.emptyOrRows(rows);

    return {
        data
    }
}

async function resetPassword(id: number) {

    const randomstring = Math.random().toString(36).slice(-12);

    await db.query(
        `UPDATE usuario
        set password = '${randomstring}' WHERE id = ${id}`
    );

    return {
        randomstring
    }
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
}