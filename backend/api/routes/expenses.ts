import { verifyToken } from "../libs/headers";
import express from 'express';
const expensesService = require('../services/expenses');
const router = express.Router();

const parsePagination = (query: any) => {
  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 20;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
  const category = typeof query.category === 'string' ? query.category.trim().toLowerCase() : '';
  const type = typeof query.type === 'string' ? query.type.trim().toLowerCase() : '';
  const from = typeof query.from === 'string' ? query.from.trim() : '';
  const to = typeof query.to === 'string' ? query.to.trim() : '';

  return { page, pageSize, search, status, category, type, from, to };
};

router.get('/getExpenses', verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idEmpresa = bearer.data.id_empresa;
    const { page, pageSize, search, status, category, type, from, to } = parsePagination(req.query);

    res.status(200).json(await expensesService.getExpenses(idEmpresa, { page, pageSize, search, status, category, type, from, to }));
  } catch (err: any) {
    console.error(`Error while getting expenses`, err.message);
    next(err);
  }
});

router.put('/addExpense', verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idUsuario = bearer.data.id_usuario;
    const idEmpresa = bearer.data.id_empresa;
    const body = { ...req.body, id_empresa: idEmpresa };
    const response = await expensesService.addExpense(body, idUsuario, 'ocasional');
    res.status(response.code || 200).json(response);
  } catch (err: any) {
    console.error(`Error while adding expense`, err.message);
    next(err);
  }
});

router.put('/addRecurringExpense', verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idUsuario = bearer.data.id_usuario;
    const idEmpresa = bearer.data.id_empresa;
    const body = { ...req.body, id_empresa: idEmpresa };
    const response = await expensesService.addExpense(body, idUsuario, 'recurrente');
    res.status(response.code || 200).json(response);
  } catch (err: any) {
    console.error(`Error while adding recurring expense`, err.message);
    next(err);
  }
});

router.put('/editExpense', verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idUsuario = bearer.data.id_usuario;
    const idEmpresa = bearer.data.id_empresa;
    const response = await expensesService.editExpense({ ...req.body, id_empresa: idEmpresa }, idUsuario);
    res.status(response.code || 200).json(response);
  } catch (err: any) {
    console.error(`Error while editing expense`, err.message);
    next(err);
  }
});

router.delete('/removeExpense', verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idUsuario = bearer.data.id_usuario;
    const idEmpresa = bearer.data.id_empresa;
    const idGasto = Number(req.query.id_gasto);
    const response = await expensesService.removeExpense(idGasto, idEmpresa, idUsuario);
    res.status(response.code || 200).json(response);
  } catch (err: any) {
    console.error(`Error while removing expense`, err.message);
    next(err);
  }
});

module.exports = router;
