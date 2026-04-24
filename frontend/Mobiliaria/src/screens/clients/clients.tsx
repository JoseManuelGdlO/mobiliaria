import Loading from '@components/loading'
import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import PrimaryButton from '@components/PrimaryButton'
import { useTheme } from '@hooks/useTheme'
import { ClientsQueryParams, IClients } from '@interfaces/clients'
import LottieView from 'lottie-react-native'
import React, { useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Linking, RefreshControl } from 'react-native'
import * as clientsService from '../../services/clients'
import SearchInput from '@components/SearchInput'
import KpiCard from '@components/KpiCard'
import { usePaginatedList } from '@hooks/usePaginatedList'
import { useLayoutMetrics } from '@theme/layout'

const Clients = (): JSX.Element => {
  const { fonts, colors } = useTheme()
  const { isTablet, contentHorizontalPadding } = useLayoutMetrics()
  const clientKey = useCallback((item: IClients) => item.id_cliente, [])
  const fetchClients = useCallback(async (params: ClientsQueryParams & { page: number, pageSize: number }) => {
    const response = await clientsService.getClients(params)
    return {
      items: response.items,
      hasMore: response.hasMore,
      total: response.total,
    }
  }, [])

  const { items, query, total, loading, refreshing, loadingMore, setQuery, onRefresh, onEndReached } = usePaginatedList<IClients, ClientsQueryParams>({
    initialQuery: { search: '' },
    fetchPage: fetchClients,
    getKey: clientKey,
  })

  const keyExtractor = (item: IClients): string => String(item.id_cliente)

  const kpis = useMemo(() => ({
    loaded: items.length,
    withPhone: items.filter((item) => (item.telefono_cliente ?? '').trim().length > 0).length,
    withMail: items.filter((item) => (item.correo_cliente ?? '').trim().length > 0).length,
  }), [items])

  const onDelete = (item: IClients): void => {
    Alert.alert('Eliminar cliente', `¿Eliminar a ${item.nombre_cliente}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          /* hook API cuando exista */
        },
      },
    ])
  }

  const callClient = async (phone?: string) => {
    const clean = (phone ?? '').replace(/\D/g, '')
    if (clean.length === 0) {
      Alert.alert('Sin teléfono', 'Este cliente no tiene teléfono registrado.')
      return
    }
    await Linking.openURL(`tel:${clean}`)
  }

  const sendWhatsApp = async (item: IClients) => {
    const clean = (item.telefono_cliente ?? '').replace(/\D/g, '')
    if (clean.length === 0) {
      Alert.alert('Sin teléfono', 'Este cliente no tiene teléfono registrado.')
      return
    }
    const text = encodeURIComponent(`Hola ${item.nombre_cliente}, te contactamos desde Mobiliaria para dar seguimiento a tu evento.`)
    await Linking.openURL(`https://wa.me/52${clean}?text=${text}`)
  }

  const renderItem = ({ item }: { item: IClients }): JSX.Element => {
    return (
      <View style={[styles.itemPad, { paddingHorizontal: contentHorizontalPadding }]}>
        <AppCard>
          <View style={styles.row}>
            <LottieView
              autoPlay
              loop
              style={styles.lottieIcon}
              source={require('../../assets/images/lottie/user.json')}
            />
            <View style={styles.textBlock}>
              <Text style={[styles.title, { color: colors.Griss50, fontFamily: fonts.Inter.SemiBold }]}>
                {item.nombre_cliente}
              </Text>
              <Text style={[styles.meta, { color: colors.gris300, fontFamily: fonts.Inter.Regular }]}>
                Tel. {item.telefono_cliente}
              </Text>
            </View>
          </View>
          <View style={styles.footerRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.small, { color: colors.gris400 }]}>Correo</Text>
              <Text style={[styles.mail, { color: colors.primario300, fontFamily: fonts.Inter.Medium }]} numberOfLines={2}>
                {item.correo_cliente}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onDelete(item)}
              style={[styles.deleteBtn, { borderColor: `${colors.red}66`, backgroundColor: `${colors.red}18` }]}
            >
              <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.red }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.actionsRow, isTablet && styles.actionsRowTablet]}>
            <PrimaryButton
              title='Llamar'
              onPress={() => { callClient(item.telefono_cliente).catch(() => Alert.alert('Error', 'No se pudo abrir el marcador.')) }}
              containerStyle={{ minWidth: 96, paddingVertical: 6 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.primario300}
            />
            <PrimaryButton
              title='WhatsApp'
              onPress={() => { sendWhatsApp(item).catch(() => Alert.alert('Error', 'No se pudo abrir WhatsApp.')) }}
              containerStyle={{ minWidth: 106, paddingVertical: 6 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.green}
            />
            <PrimaryButton
              title='Historial'
              onPress={() => Alert.alert('Historial', 'Próximamente: historial de eventos del cliente.')}
              containerStyle={{ minWidth: 98, paddingVertical: 6 }}
              textStyle={{ fontSize: 12, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
              backgroundButton={colors.Morado600}
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
              source={require('../../assets/images/lottie/clients.json')}
            />
            <View style={[styles.contentPad, { paddingHorizontal: contentHorizontalPadding }]}>
              <SearchInput
                value={query.search ?? ''}
                placeholder='Buscar por nombre, teléfono o correo'
                onChangeText={(value) => setQuery((prev: ClientsQueryParams) => ({ ...prev, search: value }))}
              />
              <View style={styles.kpiRow}>
                <KpiCard label='Cargados' value={String(kpis.loaded)} hint={`Total: ${total}`} />
                <KpiCard label='Con teléfono' value={String(kpis.withPhone)} />
                <KpiCard label='Con correo' value={String(kpis.withMail)} />
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
          !loading ? <EmptyState title="No hay clientes cargados." subtitle="Agrega clientes desde tu flujo habitual." /> : null
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
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  itemPad: { paddingHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  lottieIcon: { width: 56, height: 56, backgroundColor: 'transparent' },
  textBlock: { flex: 1, paddingLeft: 8 },
  title: { fontSize: 16 },
  meta: { fontSize: 12, marginTop: 4 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)' },
  small: { fontSize: 11 },
  mail: { fontSize: 13, marginTop: 4 },
  deleteBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionsRowTablet: { justifyContent: 'flex-start', gap: 10 },
  loadMore: { textAlign: 'center', marginVertical: 14, fontSize: 12 },
})

export default Clients
