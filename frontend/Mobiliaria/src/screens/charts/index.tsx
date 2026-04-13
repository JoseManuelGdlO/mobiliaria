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

const Charts = (): JSX.Element => {
  const animation = useRef(null)
  const [intervalMonth, setIntervalMonth] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<any>()
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
              Clientes frecuentes
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
