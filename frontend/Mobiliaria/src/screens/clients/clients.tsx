import Loading from '@components/loading'
import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import { useTheme } from '@hooks/useTheme'
import { IClients } from '@interfaces/clients'
import LottieView from 'lottie-react-native'
import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native'
import * as clientsService from '../../services/clients'

const Clients = (): JSX.Element => {
  const [workers, setWorkers] = React.useState<IClients[]>([])
  const [loading, setLoading] = React.useState(false)

  const { fonts, colors } = useTheme()

  const getWorkers = async () => {
    setLoading(true)
    try {
      const list = await clientsService.getClients()
      setWorkers(list as IClients[])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getWorkers()
  }, [])

  const keyExtractor = (item: IClients): string => String(item.id_cliente)

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

  const renderItem = ({ item }: { item: IClients }): JSX.Element => {
    return (
      <View style={styles.itemPad}>
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
            source={require('../../assets/images/lottie/clients.json')}
          />
        }
        data={workers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
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
  heroLottie: { width: '100%', height: 200, backgroundColor: 'transparent' },
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
})

export default Clients
