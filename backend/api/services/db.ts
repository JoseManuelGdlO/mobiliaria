const mysql = require('mysql2/promise');
import { config } from'../config';

export module db {

    export async function query(sql: any, params?: any) {

        const connection = await mysql.createConnection(config.db);
        const [results,] = await connection.execute(sql, params);
        await connection.end();
        return results;
    }

    export async function connection() {
        return (await mysql.createConnection(config.db))
    }

}
