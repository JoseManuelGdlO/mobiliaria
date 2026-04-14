import Loading from '@components/loading'
import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import PrimaryButton from '@components/PrimaryButton'
import { useTheme } from '@hooks/useTheme'
import { IPayments, PaymentsQueryParams } from '@interfaces/payments'
import LottieView from 'lottie-react-native'
import React, { useMemo, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, Linking, Alert } from 'react-native'
import * as paymentService from '../../services/payments'
import { useNavigation } from '@react-navigation/native'
import { NavigationScreens } from '@interfaces/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import SearchInput from '@components/SearchInput'
import FilterChips from '@components/FilterChips'
import KpiCard from '@components/KpiCard'
import StatusBadge from '@components/StatusBadge'
import { usePaginatedList } from '@hooks/usePaginatedList'

const Payments = (): JSX.Element => {
  const { fonts, colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const paymentKey = useCallback((item: IPayments) => item.id_evento, [])
  const fetchPayments = useCallback(async (params: PaymentsQueryParams & { page: number, pageSize: number }) => {
    const response = await paymentService.getPayments(params)
    return {
      items: response.items,
      hasMore: response.hasMore,
      total: response.total,
    }
  }, [])

  const { items, query, total, loading, refreshing, loadingMore, hasMore, setQuery, onRefresh, onEndReached } = usePaginatedList<IPayments, PaymentsQueryParams>({
    initialQuery: { search: '', status: '' },
    fetchPage: fetchPayments,
    getKey: paymentKey,
  })

  const keyExtractor = (item: IPayments, index: number): string =>
    item.id_evento != null ? String(item.id_evento) : `p-${index}`

  const kpis = useMemo(() => {
    const pending = items.filter((item) => Number(item.saldo ?? 0) > 0)
    const paid = items.filter((item) => Number(item.saldo ?? 0) <= 0)
    const pendingAmount = pending.reduce((acc, item) => acc + Number(item.saldo ?? 0), 0)
    return {
      pendingCount: pending.length,
      paidCount: paid.length,
      pendingAmount,
    }
  }, [items])

  const getStatus = (item: IPayments): 'paid' | 'pending' | 'partial' => {
    if (Number(item.saldo ?? 0) <= 0) return 'paid'
    if (Number(item.anticipo ?? 0) > 0) return 'partial'
    return 'pending'
  }

  const sendReminder = async (item: IPayments) => {
    const phone = (item.telefono_titular_evento ?? '').replace(/\D/g, '')
    if (phone.length === 0) {
      Alert.alert('Sin teléfono', 'Este cliente no tiene teléfono para enviar recordatorio.')
      return
    }

    const message = encodeURIComponent(`Hola ${item.nombre_titular_evento}, te recordamos tu saldo pendiente de $${Number(item.saldo ?? 0).toFixed(2)} del evento "${item.nombre_evento}".`)
    await Linking.openURL(`https://wa.me/52${phone}?text=${message}`)
  }

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
            <StatusBadge status={getStatus(item)} />
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
                {item.fecha_envio_evento?.split('T')[0] ?? '-'}
              </Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <PrimaryButton
              containerStyle={{ paddingVertical: 6, paddingHorizontal: 10, minWidth: 92 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.Morado600}
              onPress={() => navigation.navigate('EventDetail', { id: item.id_evento })}
              title="Detalle"
            />
            <PrimaryButton
              containerStyle={{ paddingVertical: 6, paddingHorizontal: 10, minWidth: 92 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.primario300}
              onPress={() => Alert.alert('Registro de pago', 'Abre el detalle del evento para registrar abonos.')}
              title="Registrar"
            />
            <PrimaryButton
              containerStyle={{ paddingVertical: 6, paddingHorizontal: 10, minWidth: 92 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.green}
              onPress={() => { sendReminder(item).catch(() => Alert.alert('Error', 'No se pudo abrir WhatsApp.')) }}
              title="Recordar"
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
          <View style={styles.headerWrap}>
            <LottieView
              autoPlay
              loop
              style={styles.heroLottie}
              source={require('../../assets/images/lottie/payments.json')}
            />
            <View style={styles.contentPad}>
              <SearchInput
                value={query.search ?? ''}
                placeholder='Buscar por evento, cliente o teléfono'
                onChangeText={(value) => setQuery((prev: PaymentsQueryParams) => ({ ...prev, search: value }))}
              />
              <FilterChips
                selected={query.status ?? ''}
                onSelect={(id) => setQuery((prev: PaymentsQueryParams) => ({ ...prev, status: id as PaymentsQueryParams['status'] }))}
                options={[
                  { id: '', label: 'Todos' },
                  { id: 'pending', label: 'Pendientes' },
                  { id: 'paid', label: 'Pagados' },
                ]}
              />
              <View style={styles.kpiRow}>
                <KpiCard label='Registros cargados' value={String(items.length)} hint={`Total: ${total}`} />
                <KpiCard label='Pendientes' value={String(kpis.pendingCount)} hint={`Pagados: ${kpis.paidCount}`} />
                <KpiCard label='Saldo visible' value={`$${kpis.pendingAmount.toFixed(2)}`} />
              </View>
            </View>
          </View>
        }
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { onRefresh().catch(console.log) }} tintColor={colors.Morado100} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => { onEndReached().catch(console.log) }}
        ListFooterComponent={loadingMore ? <Text style={[styles.loadMore, { color: colors.gris300 }]}>Cargando más...</Text> : null}
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
  headerWrap: { paddingBottom: 8 },
  contentPad: { paddingHorizontal: 16 },
  heroLottie: { width: '100%', height: 200, backgroundColor: 'transparent' },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
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
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  loadMore: { textAlign: 'center', marginVertical: 14, fontSize: 12 },
})

export default Payments
