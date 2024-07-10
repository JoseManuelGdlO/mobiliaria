const mysql = require('mysql2/promise');
import { config } from'../config';

export module db {

    export async function query(sql: any, params?: any) {

        try {
            console.log('sql', sql);
            
            const connection = await mysql.createConnection(config.db);
            console.log('connection', connection);
            
            const [results,] = await connection.execute(sql, params);
            console.log('results', results);
            
            await connection.end();
            return results;
        } catch (error) {
            console.log(error);
        }
    }

    export async function connection() {
        return (await mysql.createConnection(config.db))
    }

}

export module dbDurangeneidad {

    export async function query(sql: any, params?: any) {

        const connection = await mysql.createConnection(config.dbDurangeneidad);
        const [results,] = await connection.execute(sql, params);
        await connection.end();
        return results;
    }

    export async function connection() {
        return (await mysql.createConnection(config.dbDurangeneidad))
    }

}

