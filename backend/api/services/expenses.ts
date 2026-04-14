import { db } from './db';
import { helper } from '../helper';

interface ExpensesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
  type?: string;
  from?: string;
  to?: string;
}

const allowedCategories = ['nomina', 'gasolina', 'varios'];
const allowedTypes = ['recurrente', 'ocasional'];
const allowedStatuses = ['activo', 'cancelado'];

const normalizeDate = (raw?: string) => {
  if (typeof raw !== 'string') return '';
  const value = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  return value;
};

async function getExpenses(idEmpresa: number, query: ExpensesQuery = {}) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
  const search = query.search?.trim() || '';
  const status = query.status?.trim().toLowerCase() || '';
  const category = query.category?.trim().toLowerCase() || '';
  const type = query.type?.trim().toLowerCase() || '';
  const from = normalizeDate(query.from);
  const to = normalizeDate(query.to);
  const offset = helper.getOffset(page, pageSize);

  const whereClauses = ['id_empresa = ?'];
  const params: any[] = [idEmpresa];

  if (search.length > 0) {
    whereClauses.push(`(
      descripcion LIKE ?
      OR categoria LIKE ?
      OR tipo LIKE ?
    )`);
    const searchLike = `%${search}%`;
    params.push(searchLike, searchLike, searchLike);
  }

  if (allowedCategories.includes(category)) {
    whereClauses.push('categoria = ?');
    params.push(category);
  }

  if (allowedTypes.includes(type)) {
    whereClauses.push('tipo = ?');
    params.push(type);
  }

  if (allowedStatuses.includes(status)) {
    whereClauses.push('status = ?');
    params.push(status);
  }

  if (from) {
    whereClauses.push('fecha >= ?');
    params.push(from);
  }

  if (to) {
    whereClauses.push('fecha <= ?');
    params.push(to);
  }

  const whereSql = whereClauses.join(' AND ');
  const totalRows: any = await db.query(
    `SELECT COUNT(*) AS total FROM gastos_mob WHERE ${whereSql}`,
    params
  );

  const total = Number(totalRows?.[0]?.total || 0);
  const rows = await db.query(
    `SELECT *
     FROM gastos_mob
     WHERE ${whereSql}
     ORDER BY fecha DESC, id_gasto DESC
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
    code: 200,
  };
}

async function addExpense(body: any, idUsuario: number, forceType?: 'recurrente' | 'ocasional') {
  const categoria = String(body?.categoria || '').trim().toLowerCase();
  const tipoFromBody = String(body?.tipo || '').trim().toLowerCase();
  const tipo = forceType || tipoFromBody || 'ocasional';
  const status = String(body?.status || 'activo').trim().toLowerCase();
  const descripcion = String(body?.descripcion || '').trim();
  const periodicidad = body?.periodicidad != null ? String(body.periodicidad).trim().toLowerCase() : null;
  const monto = Number(body?.monto ?? 0);
  const fecha = normalizeDate(String(body?.fecha || '')) || new Date().toISOString().split('T')[0];
  const idEmpresa = Number(body?.id_empresa ?? 0);

  if (!allowedCategories.includes(categoria)) {
    return { data: 'Categoria invalida', code: 400 };
  }
  if (!allowedTypes.includes(tipo)) {
    return { data: 'Tipo invalido', code: 400 };
  }
  if (!allowedStatuses.includes(status)) {
    return { data: 'Status invalido', code: 400 };
  }
  if (!Number.isFinite(monto) || monto <= 0) {
    return { data: 'Monto invalido', code: 400 };
  }
  if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
    return { data: 'Empresa invalida', code: 400 };
  }
  if (tipo === 'recurrente' && !periodicidad) {
    return { data: 'Periodicidad requerida para gastos recurrentes', code: 400 };
  }

  try {
    const result: any = await db.query(
      `INSERT INTO gastos_mob
      (id_empresa, id_usuario, categoria, tipo, monto, fecha, descripcion, periodicidad, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [idEmpresa, idUsuario, categoria, tipo, monto, fecha, descripcion, periodicidad, status]
    );

    return {
      data: {
        id_gasto: result?.insertId,
      },
      code: 201,
    };
  } catch (error) {
    console.error(error);
    return { data: error, code: 405 };
  }
}

async function editExpense(body: any, idUsuario: number) {
  const idGasto = Number(body?.id_gasto ?? 0);
  const idEmpresa = Number(body?.id_empresa ?? 0);
  if (!Number.isFinite(idGasto) || idGasto <= 0) {
    return { data: 'ID de gasto invalido', code: 400 };
  }
  if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
    return { data: 'Empresa invalida', code: 400 };
  }

  const updates: string[] = ['id_usuario = ?'];
  const params: any[] = [idUsuario];

  if (body.categoria != null) {
    const categoria = String(body.categoria).trim().toLowerCase();
    if (!allowedCategories.includes(categoria)) return { data: 'Categoria invalida', code: 400 };
    updates.push('categoria = ?');
    params.push(categoria);
  }

  if (body.tipo != null) {
    const tipo = String(body.tipo).trim().toLowerCase();
    if (!allowedTypes.includes(tipo)) return { data: 'Tipo invalido', code: 400 };
    updates.push('tipo = ?');
    params.push(tipo);
  }

  if (body.status != null) {
    const status = String(body.status).trim().toLowerCase();
    if (!allowedStatuses.includes(status)) return { data: 'Status invalido', code: 400 };
    updates.push('status = ?');
    params.push(status);
  }

  if (body.monto != null) {
    const monto = Number(body.monto);
    if (!Number.isFinite(monto) || monto <= 0) return { data: 'Monto invalido', code: 400 };
    updates.push('monto = ?');
    params.push(monto);
  }

  if (body.fecha != null) {
    const fecha = normalizeDate(String(body.fecha));
    if (!fecha) return { data: 'Fecha invalida', code: 400 };
    updates.push('fecha = ?');
    params.push(fecha);
  }

  if (body.descripcion != null) {
    updates.push('descripcion = ?');
    params.push(String(body.descripcion).trim());
  }

  if (body.periodicidad !== undefined) {
    const periodicidad = body.periodicidad == null ? null : String(body.periodicidad).trim().toLowerCase();
    updates.push('periodicidad = ?');
    params.push(periodicidad);
  }

  updates.push('updated_at = NOW()');
  params.push(idGasto, idEmpresa);

  try {
    const result: any = await db.query(
      `UPDATE gastos_mob SET ${updates.join(', ')} WHERE id_gasto = ? AND id_empresa = ?`,
      params
    );
    return {
      data: {
        affectedRows: Number(result?.affectedRows || 0),
      },
      code: 200,
    };
  } catch (error) {
    console.error(error);
    return { data: error, code: 405 };
  }
}

async function removeExpense(idGasto: number, idEmpresa: number, idUsuario: number) {
  if (!Number.isFinite(idGasto) || idGasto <= 0) {
    return { data: 'ID de gasto invalido', code: 400 };
  }
  if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
    return { data: 'Empresa invalida', code: 400 };
  }

  try {
    const result: any = await db.query(
      `UPDATE gastos_mob
       SET status = 'cancelado', id_usuario = ?, updated_at = NOW()
       WHERE id_gasto = ? AND id_empresa = ?`,
      [idUsuario, idGasto, idEmpresa]
    );
    return {
      data: {
        affectedRows: Number(result?.affectedRows || 0),
      },
      code: 200,
    };
  } catch (error) {
    console.error(error);
    return { data: error, code: 405 };
  }
}

module.exports = {
  getExpenses,
  addExpense,
  editExpense,
  removeExpense,
};
