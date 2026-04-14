export interface TopClientRevenue {
  client_name: string
  total_events: number
  total_income: number
}

export interface TopEventType {
  event_type: string
  total_events: number
  total_income: number
}

export interface SalesKpis {
  total_events: number
  paid_events: number
  pending_events: number
  payment_rate: number
  total_income: number
  avg_ticket: number
  pending_balance_total: number
  recurrent_clients: number
  top_clients_by_revenue: TopClientRevenue[]
  top_event_types: TopEventType[]
}

export interface ReportsResponse {
  mostRent: any[]
  eventos: {
    total: number
    numero_eventos: number
    promedio: number
  }
  Quantity: any[]
  salesKpis: SalesKpis
}
