import { db } from './db';
import { helper } from '../helper';

interface ClientsQuery {
    page?: number;
    pageSize?: number;
    search?: string;
}

async function getClients(id: number, query: ClientsQuery = {}) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const search = query.search?.trim() || '';
    const offset = helper.getOffset(page, pageSize);

    const whereClauses = ['id_empresa = ?'];
    const params: any[] = [id];

    if (search.length > 0) {
        whereClauses.push(`(
            nombre_cliente LIKE ?
            OR telefono_cliente LIKE ?
            OR correo_cliente LIKE ?
        )`);
        const searchLike = `%${search}%`;
        params.push(searchLike, searchLike, searchLike);
    }

    const whereSql = whereClauses.join(' AND ');
    const totalRows: any = await db.query(
        `SELECT COUNT(*) as total
         FROM catalogo_clientes_mob
         WHERE ${whereSql}`,
        params
    );

    const total = Number(totalRows?.[0]?.total || 0);
    const rows = await db.query(
        `SELECT *
         FROM catalogo_clientes_mob
         WHERE ${whereSql}
         ORDER BY nombre_cliente
         LIMIT ${Math.floor(pageSize)} OFFSET ${Math.floor(offset)}`,
        params
    );

    const items = helper.emptyOrRows(rows);
    const hasMore = offset + items.length < total;

    return {
        data: items,
        items,
        total,
        page,
        pageSize,
        hasMore,
        code: 200
    };
}

module.exports = {
    getClients
}