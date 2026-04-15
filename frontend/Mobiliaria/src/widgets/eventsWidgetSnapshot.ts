import { monthToString } from '@utils/dateFormat'
import { WidgetDaySnapshot, WidgetDisplayMode, WidgetEventItem } from './types'

const shortAddress = (raw: unknown): string => {
  if (typeof raw !== 'string') {
    return ''
  }

  const trimmed = raw.trim()
  if (trimmed.length <= 64) {
    return trimmed
  }

  return `${trimmed.slice(0, 61)}...`
}

const formatTime = (raw: unknown): string => {
  if (typeof raw !== 'string') {
    return '--:--'
  }

  const [hour = '--', minute = '--'] = raw.split(':')
  return `${hour}:${minute}`
}

const mapEvent = (eventItem: any): WidgetEventItem => ({
  id: String(eventItem?.id_evento ?? `${eventItem?.hora_envio_evento ?? 'ev'}-${eventItem?.nombre_titular_evento ?? ''}`),
  title: String(eventItem?.nombre_titular_evento ?? 'Sin titular'),
  address: shortAddress(eventItem?.direccion_evento),
  time: formatTime(eventItem?.hora_envio_evento),
  paid: eventItem?.pagado_evento === 1,
})

const formatCurrencyMx = (value: string): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(value))

const formatListDateLabel = (ymd: string): string => {
  const parts = ymd.split('-')
  if (parts.length !== 3) {
    return ymd
  }
  const day = Number(parts[2])
  const month = Number(parts[1])
  if (Number.isNaN(day) || Number.isNaN(month)) {
    return ymd
  }
  return `${day} de ${monthToString(month)}`
}

export const buildWidgetDaySnapshot = (input: {
  anchorDate: string
  listDate: string
  displayMode: WidgetDisplayMode
  totalRaw: string
  events: any[]
}): WidgetDaySnapshot => {
  const eventsList = Array.isArray(input.events) ? input.events.map(mapEvent) : []
  const total =
    eventsList.length === 0 ? formatCurrencyMx('0') : formatCurrencyMx(input.totalRaw)

  return {
    date: input.listDate,
    updatedAt: new Date().toISOString(),
    total,
    events: eventsList,
    displayMode: input.displayMode,
    anchorDate: input.anchorDate,
    listDate: input.listDate,
    listDateLabel: formatListDateLabel(input.listDate),
  }
}
