export type ExpenseCategory = 'nomina' | 'gasolina' | 'varios'
export type ExpenseType = 'recurrente' | 'ocasional'
export type ExpenseStatus = 'activo' | 'cancelado'

export interface IExpense {
  id_gasto: number
  id_empresa: number
  id_usuario: number
  categoria: ExpenseCategory
  tipo: ExpenseType
  monto: number
  fecha: string
  descripcion?: string
  periodicidad?: string | null
  status: ExpenseStatus
  created_at?: string
  updated_at?: string
}

export interface ExpensesQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: ExpenseStatus | ''
  category?: ExpenseCategory | ''
  type?: ExpenseType | ''
  from?: string
  to?: string
}

export interface ExpensePayload {
  categoria: ExpenseCategory
  tipo: ExpenseType
  monto: number
  fecha: string
  descripcion?: string
  periodicidad?: string | null
  status?: ExpenseStatus
}

export interface FinancialSummary {
  income_total: number
  expenses_total: number
  balance: number
  breakdown: {
    by_category: Array<{ categoria: ExpenseCategory, total: number }>
    by_type: Array<{ tipo: ExpenseType, total: number }>
  }
  months: number
  period?: 'current_month' | 'previous_month' | 'rolling_months'
  month?: number | null
  year?: number | null
  compare?: {
    month: number
    year: number
    income_total: number
    expenses_total: number
    balance: number
    breakdown: {
      by_category: Array<{ categoria: ExpenseCategory, total: number }>
      by_type: Array<{ tipo: ExpenseType, total: number }>
    }
  } | null
  delta?: {
    income_total: number
    expenses_total: number
    balance: number
  } | null
}
