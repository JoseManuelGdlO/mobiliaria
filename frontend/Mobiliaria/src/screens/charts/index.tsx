import LottieView from 'lottie-react-native'
import { useEffect, useRef, useState, useMemo } from 'react'
import { ScrollView, Text, View, StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import * as reportsService from '@services/reports'
import Loading from '@components/loading'
import AppCard from '@components/AppCard'
import { useTheme } from '@hooks/useTheme'
import { currencyFormat } from '@utils/dateFormat'
import { createAppPickerSelectStyle } from '@utils/pickerSelectTheme'
import { ReportsResponse, SalesKpis } from '@interfaces/reports'

const Charts = (): JSX.Element => {
  const animation = useRef(null)
  const [intervalMonth, setIntervalMonth] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<ReportsResponse>()
  const { fonts, colors } = useTheme()

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

  useEffect(() => {
    getReports(1)
  }, [])

  const getReports = async (value: number) => {
    try {
      setIntervalMonth(value)
      setLoading(true)
      const response = await reportsService.getReports(value)
      setReports(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const quantity = reports?.Quantity ?? []
  const mostRent = reports?.mostRent ?? []
  const salesKpis: SalesKpis = reports?.salesKpis ?? {
    total_events: 0,
    paid_events: 0,
    pending_events: 0,
    payment_rate: 0,
    total_income: 0,
    avg_ticket: 0,
    pending_balance_total: 0,
    recurrent_clients: 0,
    top_clients_by_revenue: [],
    top_event_types: [],
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.DarkViolet300 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
      >
        <View style={styles.heroRow}>
          <LottieView
            ref={animation}
            autoPlay
            loop
            style={styles.heroLottie}
            source={require('../../assets/images/lottie/chart.json')}
          />
          <View style={styles.heroText}>
            <Text style={[styles.intro, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Estadísticas de rentas, pagos y eventos. Elige el intervalo de tiempo.
            </Text>
            <View style={[styles.pickerWrap, { borderBottomColor: `${colors.Griss50}33` }]}>
              <RNPickerSelect
                {...pickerCommon}
                Icon={PickerChevron}
                value={intervalMonth}
                onValueChange={(value: number) => getReports(value)}
                items={[
                  { label: '1 mes atrás', value: 1 },
                  { label: '2 meses atrás', value: 2 },
                  { label: '3 meses atrás', value: 3 },
                  { label: '4 meses atrás', value: 4 },
                  { label: '5 meses atrás', value: 5 },
                  { label: '6 meses atrás', value: 6 },
                  { label: '7 meses atrás', value: 7 },
                  { label: '8 meses atrás', value: 8 },
                  { label: '9 meses atrás', value: 9 },
                  { label: '10 meses atrás', value: 10 },
                  { label: '11 meses atrás', value: 11 },
                  { label: '12 meses atrás', value: 12 },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionPad}>
          <AppCard style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              KPI de ventas ({intervalMonth} mes{intervalMonth > 1 ? 'es' : ''})
            </Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: colors.gris400 }]}>Ingreso total</Text>
                <Text style={[styles.kpiValue, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
                  {currencyFormat(salesKpis.total_income)}
                </Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: colors.gris400 }]}>Ticket promedio</Text>
                <Text style={[styles.kpiValue, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
                  {currencyFormat(salesKpis.avg_ticket)}
                </Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: colors.gris400 }]}>Tasa de cobro</Text>
                <Text style={[styles.kpiValue, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
                  {salesKpis.payment_rate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: colors.gris400 }]}>Clientes recurrentes</Text>
                <Text style={[styles.kpiValue, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
                  {salesKpis.recurrent_clients}
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Conversión y cobranza
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Eventos totales: <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>{salesKpis.total_events}</Text>
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Eventos pagados: <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>{salesKpis.paid_events}</Text>
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Eventos pendientes: <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>{salesKpis.pending_events}</Text>
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Saldo pendiente: <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>{currencyFormat(salesKpis.pending_balance_total)}</Text>
            </Text>
          </AppCard>

          <AppCard style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Eventos en {intervalMonth} mes{intervalMonth > 1 ? 'es' : ''}
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Total generado:{' '}
              <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>
                {currencyFormat(reports?.eventos?.total)}
              </Text>
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Total de eventos:{' '}
              <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>
                {reports?.eventos?.numero_eventos}
              </Text>
            </Text>
            <Text style={[styles.line, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
              Promedio por evento:{' '}
              <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }}>
                {currencyFormat(reports?.eventos?.promedio)}
              </Text>
            </Text>
          </AppCard>

          <AppCard padding={12} style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Clientes frecuentes (volumen)
            </Text>
            <Text style={[styles.sub, { color: colors.gris400, fontFamily: fonts.Inter.Regular }]}>
              Clientes con más rentas en el intervalo seleccionado.
            </Text>
            <View style={[styles.tableHead, { borderBottomColor: `${colors.Griss50}22` }]}>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Nombre</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Veces</Text>
            </View>
            {quantity.map((item: any, index: number) => (
              <View
                key={`q-${index}`}
                style={[styles.tableRow, { borderBottomColor: `${colors.Griss50}12` }]}
              >
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Regular }]} numberOfLines={2}>
                  {item.nombre_titular_evento}
                </Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{item.veces_agrupado}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard padding={12} style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Top clientes por ingreso
            </Text>
            <View style={[styles.tableHead3, { borderBottomColor: `${colors.Griss50}22` }]}>
              <Text style={[styles.th, { flex: 2, color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Cliente</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Eventos</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Ingreso</Text>
            </View>
            {salesKpis.top_clients_by_revenue.map((item, index) => (
              <View
                key={`c-${index}`}
                style={[styles.tableRow3, { borderBottomColor: `${colors.Griss50}12` }]}
              >
                <Text style={[styles.td, { flex: 2, color: colors.Griss100, fontFamily: fonts.Inter.Regular }]} numberOfLines={2}>
                  {item.client_name}
                </Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{item.total_events}</Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{currencyFormat(item.total_income)}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard padding={12} style={{ marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Tipos de evento más rentables
            </Text>
            <View style={[styles.tableHead3, { borderBottomColor: `${colors.Griss50}22` }]}>
              <Text style={[styles.th, { flex: 2, color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Tipo</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Eventos</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Ingreso</Text>
            </View>
            {salesKpis.top_event_types.map((item, index) => (
              <View
                key={`t-${index}`}
                style={[styles.tableRow3, { borderBottomColor: `${colors.Griss50}12` }]}
              >
                <Text style={[styles.td, { flex: 2, color: colors.Griss100, fontFamily: fonts.Inter.Regular }]} numberOfLines={2}>
                  {item.event_type || 'Sin tipo'}
                </Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{item.total_events}</Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{currencyFormat(item.total_income)}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard padding={12}>
            <Text style={[styles.sectionTitle, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Mobiliario más rentado
            </Text>
            <Text style={[styles.sub, { color: colors.gris400, fontFamily: fonts.Inter.Regular }]}>
              Productos más solicitados en el intervalo.
            </Text>
            <View style={[styles.tableHead3, { borderBottomColor: `${colors.Griss50}22` }]}>
              <Text style={[styles.th, { flex: 2, color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Nombre</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Rentas</Text>
              <Text style={[styles.th, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>Cant.</Text>
            </View>
            {mostRent.map((item: any, index: number) => (
              <View
                key={`m-${index}`}
                style={[styles.tableRow3, { borderBottomColor: `${colors.Griss50}12` }]}
              >
                <Text style={[styles.td, { flex: 2, color: colors.Griss100, fontFamily: fonts.Inter.Regular }]} numberOfLines={2}>
                  {item.nombre_mobiliario}
                </Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{item.veces_rentado}</Text>
                <Text style={[styles.td, { color: colors.Griss100, fontFamily: fonts.Inter.Medium }]}>{item.ocupados}</Text>
              </View>
            ))}
          </AppCard>
        </View>
      </ScrollView>
      <Loading loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  heroRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8 },
  heroLottie: { width: '32%', height: 140, backgroundColor: 'transparent' },
  heroText: { flex: 1, paddingLeft: 8, justifyContent: 'center' },
  intro: { fontSize: 13, lineHeight: 18 },
  pickerWrap: { marginTop: 10, borderBottomWidth: 1, alignSelf: 'stretch' },
  sectionPad: { paddingHorizontal: 16, marginTop: 8 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiItem: { width: '48%', marginBottom: 10, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  kpiLabel: { fontSize: 12, marginBottom: 4 },
  kpiValue: { fontSize: 15 },
  sectionTitle: { fontSize: 16, marginBottom: 8 },
  sub: { fontSize: 12, marginBottom: 10 },
  line: { fontSize: 13, marginTop: 4 },
  tableHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  tableHead3: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  th: { fontSize: 12, flex: 1 },
  td: { fontSize: 12, flex: 1 },
})

export default Charts
