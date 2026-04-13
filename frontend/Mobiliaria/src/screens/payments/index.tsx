import Loading from '@components/loading'
import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import PrimaryButton from '@components/PrimaryButton'
import { useTheme } from '@hooks/useTheme'
import { IPayments } from '@interfaces/payments'
import LottieView from 'lottie-react-native'
import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import * as paymentService from '../../services/payments'
import { useNavigation } from '@react-navigation/native'
import { NavigationScreens } from '@interfaces/navigation'
import { StackNavigationProp } from '@react-navigation/stack'

const Payments = (): JSX.Element => {
  const [workers, setWorkers] = React.useState<IPayments[]>([])
  const [loading, setLoading] = React.useState(false)

  const { fonts, colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()

  const getWorkers = async () => {
    setLoading(true)
    try {
      const list = (await paymentService.getPayments()) as IPayments[]
      setWorkers(list)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getWorkers()
  }, [])

  const keyExtractor = (item: IPayments, index: number): string =>
    item.id_evento != null ? String(item.id_evento) : `p-${index}`

  const renderItem = ({ item }: { item: IPayments }): JSX.Element => {
    return (
      <View style={styles.itemPad}>
        <AppCard>
          <View style={styles.row}>
            <LottieView
              autoPlay
              loop
              style={styles.lottieIcon}
              source={require('../../assets/images/lottie/money.json')}
            />
            <View style={styles.textBlock}>
              <Text style={[styles.title, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>
                {item.nombre_evento}
              </Text>
              <Text style={[styles.meta, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
                {item.nombre_titular_evento} · {item.tipo_evento}
              </Text>
            </View>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.saldo, { color: colors.Morado100, fontFamily: fonts.Inter.SemiBold }]}>
              Saldo pendiente: ${item.saldo?.toFixed(2)}
            </Text>
            <Text style={[styles.small, { color: colors.gris300 }]}>
              Pagado: ${item.anticipo?.toFixed(2)}
            </Text>
            <Text style={[styles.small, { color: colors.gris300 }]}>
              Costo total: ${item.costo_total?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <View>
              <Text style={[styles.small, { color: colors.gris400 }]}>Fecha del evento</Text>
              <Text style={[styles.date, { color: colors.primario300, fontFamily: fonts.Inter.Medium }]}>
                {item.fecha_envio_evento.split('T')[0]}
              </Text>
            </View>
            <PrimaryButton
              containerStyle={{ paddingVertical: 6, paddingHorizontal: 12, minWidth: 100 }}
              textStyle={{ fontSize: 13, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.Morado600}
              onPress={() => navigation.navigate('EventDetail', { id: item.id_evento })}
              title="Detalle"
            />
          </View>
        </AppCard>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.DarkViolet300 }]}>
      <FlatList
        ListHeaderComponent={
          <LottieView
            autoPlay
            loop
            style={styles.heroLottie}
            source={require('../../assets/images/lottie/payments.json')}
          />
        }
        data={workers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="No hay pagos registrados en este momento." subtitle="Vuelve más tarde o sincroniza datos." />
          ) : null
        }
      />
      <Loading loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 32 },
  heroLottie: { width: '100%', height: 200, backgroundColor: 'transparent' },
  itemPad: { paddingHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  lottieIcon: { width: 56, height: 56, backgroundColor: 'transparent' },
  textBlock: { flex: 1, paddingLeft: 8 },
  title: { fontSize: 16 },
  meta: { fontSize: 12, marginTop: 4 },
  amounts: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)' },
  saldo: { fontSize: 15, marginBottom: 4 },
  small: { fontSize: 12, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  date: { fontSize: 13, marginTop: 4 },
})

export default Payments
