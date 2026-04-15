export type WidgetDisplayMode = 'today' | 'next'

export interface WidgetEventItem {
  id: string
  title: string
  address: string
  time: string
  paid: boolean
}

/** Snapshot for home screen widgets; `date` mirrors listDate for older native parsers. */
export interface WidgetDaySnapshot {
  /** @deprecated use listDate — kept for backward compatibility */
  date: string
  updatedAt: string
  total: string
  events: WidgetEventItem[]
  displayMode: WidgetDisplayMode
  anchorDate: string
  listDate: string
  /** Human label e.g. "17 de Abril" */
  listDateLabel: string
}
