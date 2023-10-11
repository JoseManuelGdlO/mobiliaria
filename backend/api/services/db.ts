const mysql = require('mysql2/promise');
const config = require('../config');

async function query(sql: any, params: any) {

    const connection = await mysql.createConnection(config.db);
    const [results,] = await connection.execute(sql, params);
    await connection.end();
    return results;
}

async function connection() {
    return (await mysql.createConnection(config.db))
}

module.exports = {
    query,
    connection
}