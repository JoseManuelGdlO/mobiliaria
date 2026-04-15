import * as eventService from '@services/events'
import { getLocalYmd } from '@utils/dateFormat'
import { buildWidgetDaySnapshot } from './eventsWidgetSnapshot'
import { requestWidgetRefresh, syncWidgetSnapshot } from './widgetSync'

const fetchEventsForDay = async (
  ymd: string,
): Promise<{ data: any[]; total: number }> => {
  try {
    const res = await eventService.getEventsDay(ymd)
    const data = Array.isArray(res?.data) ? res.data : []
    const total = typeof res?.total === 'number' ? res.total : 0
    return { data, total }
  } catch {
    return { data: [], total: 0 }
  }
}

const pickNextDayWithEvents = (today: string, rows: any[]): string | null => {
  const dates: string[] = []
  for (const row of rows) {
    const raw = row?.fecha_envio_evento
    if (typeof raw !== 'string') {
      continue
    }
    const ymd = raw.split('T')[0]
    if (ymd && ymd > today) {
      dates.push(ymd)
    }
  }
  if (dates.length === 0) {
    return null
  }
  return dates.sort()[0]
}

/**
 * Always syncs the widget to local "today" (and next day with events if today is empty).
 * Independent of the calendar selection on Home.
 */
export const refreshHomeWidgetSnapshot = async (): Promise<void> => {
  const today = getLocalYmd()
  const first = await fetchEventsForDay(today)

  if (first.data.length > 0) {
    const snapshot = buildWidgetDaySnapshot({
      anchorDate: today,
      listDate: today,
      displayMode: 'today',
      totalRaw: String(first.total),
      events: first.data,
    })
    await syncWidgetSnapshot(snapshot)
    await requestWidgetRefresh().catch(() => {})
    return
  }

  let nextDay: string | null = null
  try {
    const agg = await eventService.getEvents()
    const rows = Array.isArray(agg?.data) ? agg.data : []
    nextDay = pickNextDayWithEvents(today, rows)
  } catch {
    nextDay = null
  }

  if (nextDay != null) {
    const second = await fetchEventsForDay(nextDay)
    if (second.data.length > 0) {
      const snapshot = buildWidgetDaySnapshot({
        anchorDate: today,
        listDate: nextDay,
        displayMode: 'next',
        totalRaw: String(second.total),
        events: second.data,
      })
      await syncWidgetSnapshot(snapshot)
    } else {
      const snapshot = buildWidgetDaySnapshot({
        anchorDate: today,
        listDate: today,
        displayMode: 'today',
        totalRaw: '0',
        events: [],
      })
      await syncWidgetSnapshot(snapshot)
    }
  } else {
    const snapshot = buildWidgetDaySnapshot({
      anchorDate: today,
      listDate: today,
      displayMode: 'today',
      totalRaw: '0',
      events: [],
    })
    await syncWidgetSnapshot(snapshot)
  }

  await requestWidgetRefresh().catch(() => {})
}
