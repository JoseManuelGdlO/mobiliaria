import {
  ADD_EXPENSE,
  ADD_RECURRING_EXPENSE,
  EDIT_EXPENSE,
  GET_EXPENSES,
  GET_FINANCIAL_SUMMARY,
  REMOVE_EXPENSE,
} from './endpoints';
import { apiClient } from './apiClient';
import { PaginatedResponse } from '@interfaces/clients';
import { ExpensePayload, ExpensesQueryParams, FinancialSummary, IExpense } from '@interfaces/expenses';

export const getExpenses = async (params: ExpensesQueryParams = {}): Promise<PaginatedResponse<IExpense>> => {
  const { data } = await apiClient.get(GET_EXPENSES, { params });
  return {
    data: data.data ?? data.items ?? [],
    items: data.items ?? data.data ?? [],
    total: data.total ?? 0,
    page: data.page ?? (params.page ?? 1),
    pageSize: data.pageSize ?? (params.pageSize ?? 20),
    hasMore: data.hasMore ?? false,
    code: data.code ?? 200,
  };
};

export const addExpense = async (payload: ExpensePayload): Promise<any> => {
  const endpoint = payload.tipo === 'recurrente' ? ADD_RECURRING_EXPENSE : ADD_EXPENSE;
  const { data } = await apiClient.put(endpoint, payload);
  return data.data;
};

export const editExpense = async (payload: Partial<ExpensePayload> & { id_gasto: number }): Promise<any> => {
  const { data } = await apiClient.put(EDIT_EXPENSE, payload);
  return data.data;
};

export const removeExpense = async (id_gasto: number): Promise<any> => {
  const { data } = await apiClient.delete(REMOVE_EXPENSE, { params: { id_gasto } });
  return data.data;
};

interface FinancialSummaryRequest {
  period?: 'current_month' | 'previous_month' | 'rolling_months'
  months?: number
  month?: number
  year?: number
  compareMonth?: number
  compareYear?: number
}

export const getFinancialSummary = async (request: FinancialSummaryRequest = { period: 'current_month' }): Promise<FinancialSummary> => {
  const params = {
    period: request.period ?? 'current_month',
    months: request.months,
    month: request.month,
    year: request.year,
    compareMonth: request.compareMonth,
    compareYear: request.compareYear,
  };
  const { data } = await apiClient.get(GET_FINANCIAL_SUMMARY, { params });
  return data.data;
};
