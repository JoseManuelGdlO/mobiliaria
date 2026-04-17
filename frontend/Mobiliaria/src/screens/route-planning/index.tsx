import AppCard from '@components/AppCard'
import DatePickerComponent from '@components/datepicker'
import EmptyState from '@components/EmptyState'
import Loading from '@components/loading'
import { IWorker } from '@interfaces/workers'
import * as eventService from '@services/events'
import * as workersService from '@services/workers'
import { getLocalYmd, monthToString } from '@utils/dateFormat'
import { createAppPickerSelectStyle } from '@utils/pickerSelectTheme'
import { useTheme } from '@hooks/useTheme'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import RNPickerSelect from 'react-native-picker-select'
import Toast from 'react-native-toast-message'

interface DayEvent {
  id_evento: number
  nombre_titular_evento: string
  direccion_evento: string
  hora_envio_evento: string
  id_repartidor?: number | null
  repartidor_nombre?: string | null
}

const RoutePlanning = (): JSX.Element => {
  const { fonts, colors } = useTheme()
  const [date, setDate] = useState(() => new Date())
  const [provDate, setProvDate] = useState(() => new Date())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [events, setEvents] = useState<DayEvent[]>([])
  const [workers, setWorkers] = useState<IWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)

  const pickerSelectStyles = useMemo(() => createAppPickerSelectStyle(colors, fonts), [colors, fonts])
  const pickerCommon = useMemo(
    () => ({
      useNativeAndroidPickerStyle: false as const,
      darkTheme: true as const,
      style: pickerSelectStyles,
      doneText: 'Listo' as const,
    }),
    [pickerSelectStyles],
  )

  const PickerChevron = (): JSX.Element => (
    <MaterialCommunityIcons name="chevron-down" size={22} color={colors.Morado100} />
  )

  const ymd = useMemo(() => getLocalYmd(date), [date])

  const dateLabel = useMemo(() => {
    const arr = ymd.split('-')
    return `${arr[2]} de ${monthToString(Number(arr[1]))} de ${arr[0]}`
  }, [ymd])

  const loadWorkers = useCallback(async () => {
    try {
      const list = (await workersService.getWorkers()) as IWorker[]
      setWorkers(Array.isArray(list) ? list : [])
    } catch {
      setWorkers([])
    }
  }, [])

  const loadEvents = useCallback(async () => {
    try {
      const res = await eventService.getEventsDay(ymd)
      const rows = res?.data
      setEvents(Array.isArray(rows) ? rows : [])
    } catch {
      setEvents([])
    }
  }, [ymd])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await Promise.all([loadWorkers(), loadEvents()])
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [loadWorkers, loadEvents])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadEvents()
    } finally {
      setRefreshing(false)
    }
  }, [loadEvents])

  const pickerItems = useMemo(() => {
    const base = [{ label: 'Sin asignar', value: '' }]
    return base.concat(
      workers.map((w) => ({
        label: w.nombre_comp,
        value: String(w.id_usuario),
      })),
    )
  }, [workers])

  const assign = async (item: DayEvent, value: string) => {
    const idRepartidor = value === '' ? null : Number(value)
    if (value !== '' && !Number.isFinite(idRepartidor)) {
      return
    }
    const prev = item.id_repartidor != null ? Number(item.id_repartidor) : null
    if ((prev == null && idRepartidor == null) || (prev != null && idRepartidor === prev)) {
      return
    }

    setSavingId(item.id_evento)
    try {
      await eventService.assignRepartidor({
        id_evento: item.id_evento,
        id_repartidor: idRepartidor,
      })
      const w = workers.find((x) => x.id_usuario === idRepartidor)
      setEvents((prev) =>
        prev.map((e) =>
          e.id_evento === item.id_evento
            ? {
                ...e,
                id_repartidor: idRepartidor,
                repartidor_nombre: idRepartidor == null ? null : w?.nombre_comp ?? null,
              }
            : e,
        ),
      )
      Toast.show({
        type: 'success',
        text1: 'Ruta actualizada',
        text2: idRepartidor == null ? 'Sin asignar' : w?.nombre_comp,
      })
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo guardar',
        text2: e instanceof Error ? e.message : 'Intenta de nuevo',
      })
    } finally {
      setSavingId(null)
    }
  }

  const timeStr = (hora: string): string => {
    if (hora == null || hora.length === 0) return ''
    const p = hora.split(':')
    return `${p[0]}:${p[1] ?? '00'}`
  }

  const keyExtractor = (item: DayEvent): string => String(item.id_evento)

  const renderItem = ({ item }: { item: DayEvent }): JSX.Element => {
    const current = item.id_repartidor != null ? String(item.id_repartidor) : ''
    return (
      <AppCard>
        <View style={{ paddingVertical: 4 }}>
          <Text
            style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}
            numberOfLines={2}
          >
            {item.nombre_titular_evento}
          </Text>
          <Text
            style={{
              fontFamily: fonts.Inter.Regular,
              fontSize: 13,
              color: colors.gris300,
              marginTop: 6,
            }}
            numberOfLines={3}
          >
            {item.direccion_evento}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.gris300} />
            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginLeft: 6 }}>
              {timeStr(item.hora_envio_evento)}
            </Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300, marginBottom: 6 }}>
              Repartidor
            </Text>
            <RNPickerSelect
              {...pickerCommon}
              value={current}
              onValueChange={(v) => {
                void assign(item, String(v ?? ''))
              }}
              items={pickerItems}
              disabled={savingId === item.id_evento}
              Icon={PickerChevron}
            />
          </View>
        </View>
      </AppCard>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
      <TouchableOpacity
        onPress={() => {
          setProvDate(date)
          setPickerOpen(true)
        }}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: colors.background_parts.card,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: `${colors.Morado100}33`,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: `${colors.Morado600}38`,
            borderWidth: 1,
            borderColor: `${colors.Morado100}44`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={24} color={colors.Morado100} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300, letterSpacing: 0.2 }}
          >
            Pedidos con entrega el
          </Text>
          <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50, marginTop: 2 }}>
            {dateLabel}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.gris300} />
      </TouchableOpacity>

      <DatePickerComponent
        open={pickerOpen}
        date={provDate}
        mode="date"
        onChangePicker={(picked) => {
          setPickerOpen(false)
          if (picked != null) {
            setDate(picked)
            setProvDate(picked)
          }
        }}
      />

      {loading ? (
        <Loading loading={loading} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 32 : 24,
            flexGrow: 1,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.Morado100} />}
          ListEmptyComponent={
            <EmptyState
              title="Sin pedidos este día"
              subtitle="Elige otra fecha o revisa el calendario en Inicio."
            />
          }
        />
      )}
    </View>
  )
}

export default RoutePlanning
