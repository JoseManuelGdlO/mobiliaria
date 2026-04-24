import React, { useEffect } from 'react'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import AppModal from '@components/AppModal'
import AppCard from '@components/AppCard'
import EmptyState from '@components/EmptyState'
import { IAvailability } from '@interfaces/availability'
import * as eventsService from '../../../services/events'
import Loading from '@components/loading'
import { useTheme } from '@hooks/useTheme'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { NavigationScreens } from '@interfaces/navigation'
import PrimaryButton from '@components/PrimaryButton'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { setInventaryRx, setPackagesRx, setTotalRx } from '@redux/actions/eventActions'
import Toast from 'react-native-toast-message'
import { toast } from '@utils/alertToast'
import { IPackage } from '@interfaces/packages'
import LottieView from 'lottie-react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ITEMS_PEER_PAGE = 20
const LABEL_ON_SOLID = '#FFFFFF'

const Availability = ({ route }: StackScreenProps<NavigationScreens, 'Available'>): JSX.Element => {
    let date = route.params.date
    if (date.includes('T')) {
        date = date.split('T')[0]
    }
    const id = route.params.id
    const animation = React.useRef<LottieView>(null)

    const dispatch = useDispatch()
    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const insets = useSafeAreaInsets()

    const [inventary, setInventary] = React.useState<IAvailability[]>([])
    const [total, setTotal] = React.useState<number>(0)
    const [invSelected, setInvSelected] = React.useState<IAvailability[]>([])
    const [pktSelected, setPktSelected] = React.useState<IPackage[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IAvailability[]>([])
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [itemSelected, setItemSelected] = React.useState<IAvailability>({} as IAvailability)
    const [itemPackageSelected, setItemPackageSelected] = React.useState<IPackage>({} as IPackage)
    const [inputvalue, setInputValue] = React.useState<string>('')
    const [errorInput, setErrorInput] = React.useState<string>('')
    const [packages, setPackages] = React.useState<IPackage[]>([])
    const [packagesSectionOpen, setPackagesSectionOpen] = React.useState(true)
    const [expandedPackageId, setExpandedPackageId] = React.useState<number | null>(null)

    const { fonts, colors, layout } = useTheme()

    const footerReserve = 200 + Math.max(insets.bottom, 12)

    const submitInv = () => {
        if (invSelected.length === 0 && pktSelected.length === 0) {
            toast('Error', 'Selecciona al menos un producto o paquete', 'error')
            return
        }
        if (id) {
            addItemsToEvent()
            return
        }

        dispatch(setInventaryRx(invSelected))
        dispatch(setPackagesRx(pktSelected))
        dispatch(setTotalRx(total))
        navigation.navigate('AddEvent', { date })
    }

    const addData = () => {
        if (search.length > 2) {
            return
        }
        let inv: IAvailability[] = []
        if (page === 1) {
            inv = totalInventary.slice(0, page * ITEMS_PEER_PAGE)
        } else {
            inv = totalInventary.slice(page * ITEMS_PEER_PAGE, page * ITEMS_PEER_PAGE + ITEMS_PEER_PAGE)
        }

        inv = [...inventary, ...inv]
        setInventary(inv)
        setPage(page + 1)
    }

    const getInventary = async () => {
        try {
            const response = await eventsService.getAvailableDay(date)

            await setTotalInventary(response.inventary)
            setPackages(response.packages)
            const inv = response.inventary.slice(0, page * ITEMS_PEER_PAGE)
            setInventary(inv)
        } catch (error) {
            console.log(error)
        } finally {
            setRefreshing(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        getInventary()
    }, [])

    const keyExtractor = (item: IAvailability, index: number): string => item.id_mob.toString() + index

    const renderItem = ({ item }: { item: IAvailability; index: number }): JSX.Element => {
        return (
            <View style={{ paddingHorizontal: layout.contentHorizontalPadding, marginBottom: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                        setItemSelected(item)
                        setModalVisible(true)
                    }}
                >
                    <AppCard>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    backgroundColor: `${colors.Morado600}35`,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaterialCommunityIcons name="cube-outline" size={26} color={colors.Morado100} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text
                                    style={{
                                        fontFamily: fonts.Inter.SemiBold,
                                        fontSize: 16,
                                        color: colors.Griss50,
                                    }}
                                    numberOfLines={2}
                                >
                                    {item.nombre_mob}
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: fonts.Inter.Regular,
                                        fontSize: 13,
                                        color: colors.gris300,
                                        marginTop: 4,
                                    }}
                                >
                                    {Number(item.cantidad_mob)} pieza{Number(item.cantidad_mob) !== 1 ? 's' : ''}{' '}
                                    disponible{Number(item.cantidad_mob) !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', paddingLeft: 8 }}>
                                <Text
                                    style={{
                                        fontFamily: fonts.Inter.SemiBold,
                                        fontSize: 15,
                                        color: colors.Morado100,
                                    }}
                                >
                                    ${item.costo_mob}
                                </Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 11, color: colors.gris400, marginTop: 2 }}>c/u</Text>
                            </View>
                        </View>
                    </AppCard>
                </TouchableOpacity>
            </View>
        )
    }

    const renderFooter = () => {
        if (search.length >= 3) return null
        const hasMore = inventary.length < totalInventary.length
        if (!hasMore) return <View style={{ height: 20 }} />
        return (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={colors.Morado600} />
            </View>
        )
    }

    const addItemsToEvent = async () => {
        try {
            setLoading(true)
            await eventsService.addItemsToEvent(Number(id), invSelected)
            navigation.navigate('EventDetail', { id: Number(id) })
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        setPage(1)
        try {
            const response = await eventsService.getAvailableDay(date)
            setTotalInventary(response.inventary)
            setPackages(response.packages)
            setInventary(response.inventary.slice(0, ITEMS_PEER_PAGE))
        } catch (e) {
            console.log(e)
        } finally {
            setRefreshing(false)
        }
    }

    const searchBar = (
        <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 12, paddingBottom: 8 }}>
            <AppCard>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="magnify" size={22} color={colors.gris300} style={{ marginRight: 10 }} />
                    <TextInput
                        style={{
                            flex: 1,
                            minHeight: 44,
                            paddingVertical: 8,
                            fontFamily: fonts.Inter.Regular,
                            fontSize: 15,
                            color: colors.Griss50,
                        }}
                        placeholder="Buscar por nombre"
                        placeholderTextColor={colors.gris400}
                        value={search}
                        onChangeText={(value: string) => {
                            setSearch(value)
                            if (value === '') {
                                setPage(1)
                                setInventary(totalInventary.slice(0, ITEMS_PEER_PAGE))
                            } else if (value.length > 2) {
                                setPage(1)
                                const filtered = totalInventary.filter((item: IAvailability) =>
                                    item.nombre_mob.toLowerCase().includes(value.toLowerCase()),
                                )
                                setInventary(filtered)
                            }
                        }}
                    />
                    {search.length > 0 ? (
                        <TouchableOpacity
                            onPress={() => {
                                setSearch('')
                                setPage(1)
                                setInventary(totalInventary.slice(0, ITEMS_PEER_PAGE))
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <MaterialCommunityIcons name="close-circle" size={22} color={colors.gris300} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </AppCard>
        </View>
    )

    const packagesSection =
        packages.length !== 0 ? (
            <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingBottom: 8 }}>
                <AppCard style={{ marginBottom: 0, padding: 0 }}>
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => {
                            setPackagesSectionOpen((prev) => {
                                if (prev) setExpandedPackageId(null)
                                return !prev
                            })
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 14,
                            paddingVertical: 14,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={packagesSectionOpen ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={colors.Morado100}
                            style={{ marginRight: 10 }}
                        />
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                backgroundColor: `${colors.Morado600}33`,
                                borderWidth: 1,
                                borderColor: `${colors.Morado100}44`,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MaterialCommunityIcons name="gift-outline" size={24} color={colors.Morado100} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Paquetes</Text>
                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                                {packages.length} opción{packages.length !== 1 ? 'es' : ''} · Toca para {packagesSectionOpen ? 'ocultar' : 'ver'} detalle y productos
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {packagesSectionOpen ? (
                        <View
                            style={{
                                paddingHorizontal: 14,
                                paddingBottom: 14,
                                borderTopWidth: StyleSheet.hairlineWidth,
                                borderTopColor: `${colors.Griss50}18`,
                            }}
                        >
                            {packages.map((pack, index) => {
                                const packOpen = expandedPackageId === pack.id
                                return (
                                    <View
                                        key={pack.id}
                                        style={{
                                            marginTop: index === 0 ? 0 : 14,
                                            paddingTop: index === 0 ? 0 : 14,
                                            borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                                            borderTopColor: `${colors.Griss50}18`,
                                        }}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.88}
                                            onPress={() => setExpandedPackageId(packOpen ? null : pack.id)}
                                            style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                                        >
                                            <MaterialCommunityIcons
                                                name={packOpen ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color={colors.Morado100}
                                                style={{ marginRight: 6, marginTop: 10 }}
                                            />
                                            <View
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 10,
                                                    backgroundColor: `${colors.Morado600}28`,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <MaterialCommunityIcons name="package-variant" size={20} color={colors.Morado100} />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <Text
                                                    style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}
                                                    numberOfLines={3}
                                                >
                                                    {pack.nombre}
                                                </Text>
                                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 4 }}>
                                                    Toca para {packOpen ? 'ocultar' : 'ver'} productos
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Morado100 }}>
                                                        ${pack.precio}
                                                    </Text>
                                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris400, marginLeft: 6 }}>
                                                        c/u
                                                    </Text>
                                                    <View
                                                        style={{
                                                            marginLeft: 10,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 3,
                                                            borderRadius: 8,
                                                            backgroundColor: `${colors.primario300}22`,
                                                            borderWidth: 1,
                                                            borderColor: `${colors.primario300}44`,
                                                        }}
                                                    >
                                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 11, color: colors.primario300 }}>
                                                            Disp. {pack.availiable ?? 0}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>

                                        {packOpen ? (
                                            <View style={{ marginTop: 12, paddingLeft: 4 }}>
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.Inter.SemiBold,
                                                        fontSize: 11,
                                                        color: colors.gris300,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Incluye
                                                </Text>
                                                {pack.products.map((prod, idx) => (
                                                    <View
                                                        key={prod.id_mob != null ? `p-${pack.id}-${prod.id_mob}` : `p-${pack.id}-${idx}`}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            paddingVertical: 10,
                                                            paddingHorizontal: 12,
                                                            marginBottom: 8,
                                                            borderRadius: 12,
                                                            backgroundColor: `${colors.Griss50}08`,
                                                            borderWidth: 1,
                                                            borderColor: `${colors.Griss50}14`,
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons name="cube-outline" size={20} color={colors.Morado100} style={{ marginRight: 10 }} />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 14, color: colors.Griss50 }} numberOfLines={2}>
                                                                {prod.nombre_mob}
                                                            </Text>
                                                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                                                                {prod.cantidad} pieza{(Number(prod.cantidad) || 0) !== 1 ? 's' : ''} en el paquete
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                                <TouchableOpacity
                                                    activeOpacity={0.88}
                                                    onPress={() => {
                                                        setItemPackageSelected(pack)
                                                        setModalVisible(true)
                                                    }}
                                                    style={{
                                                        marginTop: 4,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: colors.Morado600,
                                                        borderRadius: 12,
                                                        paddingVertical: 12,
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color={LABEL_ON_SOLID} />
                                                    <Text
                                                        style={{
                                                            fontFamily: fonts.Inter.SemiBold,
                                                            fontSize: 15,
                                                            color: LABEL_ON_SOLID,
                                                            marginLeft: 8,
                                                        }}
                                                    >
                                                        Agregar este paquete
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : null}
                                    </View>
                                )
                            })}
                        </View>
                    ) : null}
                </AppCard>
            </View>
        ) : null

    const listHeader = (
        <View>
            {searchBar}
            {packagesSection}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.contentHorizontalPadding + 4, marginTop: 4, marginBottom: 8 }}>
                <MaterialCommunityIcons name="warehouse" size={22} color={colors.Morado100} />
                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 18, color: colors.Griss50, marginLeft: 8 }}>Productos</Text>
            </View>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
            <FlatList
                ListHeaderComponent={listHeader}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                data={inventary}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={renderFooter}
                onEndReachedThreshold={0.3}
                onEndReached={addData}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.Morado600} />}
                contentContainerStyle={{ paddingBottom: footerReserve, flexGrow: 1 }}
                ListEmptyComponent={
                    !loading ? (
                        <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 8 }}>
                            <EmptyState
                                title="No hay productos para mostrar"
                                subtitle="Agrega artículos al inventario para poder asignarlos al evento."
                            />
                            <LottieView
                                ref={animation}
                                autoPlay
                                loop
                                style={{ width: 120, height: 120, alignSelf: 'center', marginTop: 8 }}
                                source={require('../../../assets/images/lottie/sad.json')}
                            />
                        </View>
                    ) : null
                }
            />

            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: layout.contentHorizontalPadding,
                    paddingTop: 12,
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: colors.DarkViolet300,
                    borderTopWidth: 1,
                    borderTopColor: `${colors.Griss50}22`,
                }}
            >
                {(invSelected.length > 0 || pktSelected.length > 0) && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300, marginBottom: 8 }}>Selección</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {invSelected.map((inv) => (
                                <View
                                    key={inv.id_mob}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.Morado600,
                                        borderRadius: 20,
                                        paddingVertical: 6,
                                        paddingLeft: 12,
                                        paddingRight: 6,
                                        marginRight: 8,
                                        marginBottom: 8,
                                        maxWidth: '100%',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: fonts.Inter.Medium,
                                            fontSize: 12,
                                            color: LABEL_ON_SOLID,
                                            flexShrink: 1,
                                            maxWidth: 220,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {inv.nombre_mob} ×{inv.cantidad}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setTotal(total - inv.costo_mob * Number(inv.cantidad))
                                            setInvSelected(invSelected.filter((item) => item.id_mob !== inv.id_mob))
                                        }}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        style={{ marginLeft: 4 }}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={20} color={LABEL_ON_SOLID} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {pktSelected.map((inv) => (
                                <View
                                    key={inv.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.Morado600,
                                        borderRadius: 20,
                                        paddingVertical: 6,
                                        paddingLeft: 12,
                                        paddingRight: 6,
                                        marginRight: 8,
                                        marginBottom: 8,
                                        maxWidth: '100%',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: fonts.Inter.Medium,
                                            fontSize: 12,
                                            color: LABEL_ON_SOLID,
                                            flexShrink: 1,
                                            maxWidth: 220,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {inv.nombre} ×{inv.cantidad}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            for (const pkt of inv.products) {
                                                const item = totalInventary.find((i) => i.id_mob === pkt.fkid_inventario)
                                                if (item) {
                                                    const cantidad = Number(item.cantidad_mob) + Number(pkt.cantidad) * Number(inv.cantidad)
                                                    item.cantidad_mob = String(cantidad)
                                                }
                                                const itemInv = inventary.find((i) => i.id_mob === pkt.id_mob)
                                                if (itemInv) {
                                                    const cantidad = Number(itemInv.cantidad_mob) + Number(pkt.cantidad) * Number(inv.cantidad)
                                                    itemInv.cantidad_mob = String(cantidad)
                                                }
                                            }
                                            setTotal(total - inv.precio * Number(inv.cantidad))
                                            setPktSelected(pktSelected.filter((item) => item.id !== inv.id))
                                        }}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        style={{ marginLeft: 4 }}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={20} color={LABEL_ON_SOLID} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <AppCard style={{ flex: 1, marginRight: 8, paddingVertical: 10, marginBottom: 0 }}>
                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300 }}>Subtotal</Text>
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Morado100, marginTop: 4 }}>${total.toFixed(2)}</Text>
                    </AppCard>
                    <AppCard style={{ flex: 1, marginLeft: 8, paddingVertical: 10, marginBottom: 0 }}>
                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300 }}>+ IVA (16%)</Text>
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Morado100, marginTop: 4 }}>
                            ${(total + total * 0.16).toFixed(2)}
                        </Text>
                    </AppCard>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                    <TouchableOpacity
                        onPress={submitInv}
                        activeOpacity={0.9}
                        style={{
                            flex: 1,
                            backgroundColor: colors.Morado600,
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                        }}
                    >
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: LABEL_ON_SOLID }}>Continuar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.88}
                        style={{
                            width: layout.isTablet ? 64 : 52,
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: `${colors.red}88`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${colors.red}18`,
                        }}
                    >
                        <MaterialCommunityIcons name="close" size={24} color={colors.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <Loading loading={loading} />
            <Toast />

            <AppModal visible={modalVisible} onRequestClose={() => setModalVisible(false)} keyboardAvoiding maxHeight={layout.modalMaxHeight}>
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="numeric" size={26} color={colors.Morado100} />
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 20, color: colors.Griss50, marginLeft: 10 }}>Cantidad</Text>
                    </View>
                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, lineHeight: 20 }}>
                        {itemSelected.nombre_mob ? itemSelected.nombre_mob : itemPackageSelected.nombre}
                        {' · '}
                        <Text style={{ color: colors.Morado100 }}>
                            ${itemSelected.costo_mob ? itemSelected.costo_mob : itemPackageSelected.precio}
                        </Text>
                        {' · Máx. '}
                        {itemSelected.cantidad_mob ? itemSelected.cantidad_mob : itemPackageSelected.availiable}
                    </Text>
                    <View
                        style={{
                            marginTop: 16,
                            backgroundColor: `${colors.Griss50}0C`,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: `${colors.Morado100}44`,
                            paddingHorizontal: 14,
                        }}
                    >
                        <TextInput
                            style={{
                                minHeight: 48,
                                fontFamily: fonts.Inter.Regular,
                                fontSize: 16,
                                color: colors.Griss50,
                            }}
                            placeholder="Cantidad"
                            placeholderTextColor={colors.gris400}
                            keyboardType="numeric"
                            autoFocus
                            onChangeText={(value: string) => {
                                setErrorInput('')

                                if (itemSelected.nombre_mob) {
                                    if (Number(value) > Number(itemSelected.cantidad_mob)) {
                                        setErrorInput('No hay suficiente inventario')
                                        setInputValue(value)
                                        return
                                    }
                                    setInputValue(value)
                                    itemSelected.cantidad = Number(value)
                                    setItemSelected(itemSelected)
                                } else {
                                    if (itemPackageSelected.availiable === 0 || Number(value) > Number(itemPackageSelected.availiable)) {
                                        setErrorInput('No hay suficiente inventario')
                                        setInputValue(value)
                                        return
                                    }
                                    setInputValue(value)
                                    itemPackageSelected.cantidad = Number(value)
                                    setItemPackageSelected(itemPackageSelected)
                                }
                            }}
                            value={inputvalue}
                        />
                    </View>
                    {errorInput.length !== 0 && (
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.red, marginTop: 8 }}>{errorInput}</Text>
                    )}
                </View>
                <View style={{ paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row' }}>
                    <PrimaryButton
                        containerStyle={{
                            flex: 1,
                            marginRight: 8,
                            borderRadius: 14,
                            minHeight: 48,
                            paddingVertical: 12,
                        }}
                        textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: LABEL_ON_SOLID }}
                        backgroundButton={colors.Morado600}
                        onPress={() => {
                            if (itemSelected.nombre_mob) {
                                let exist = false
                                let localtotal = 0
                                for (const inv of invSelected) {
                                    if (inv.id_mob === itemSelected.id_mob) {
                                        inv.cantidad = itemSelected.cantidad
                                        setInvSelected(invSelected)
                                        setModalVisible(false)
                                        exist = true
                                        setInputValue('')
                                    }
                                    localtotal += inv.costo_mob * Number(inv.cantidad)
                                }

                                if (exist) {
                                    setTotal(localtotal)
                                    return
                                }

                                setInvSelected([...invSelected, itemSelected])
                                const cantidad = Number(itemSelected.cantidad)
                                setTotal(total + itemSelected.costo_mob * cantidad)
                                setInputValue('')
                                setModalVisible(false)
                            } else {
                                const oldQnty = itemPackageSelected.cantidad ? itemPackageSelected.cantidad : 0
                                let exist = false
                                let localtotal = 0
                                for (const pkt of pktSelected) {
                                    if (pkt.id === itemPackageSelected.id) {
                                        pkt.cantidad = itemPackageSelected.cantidad
                                        setPktSelected(pktSelected)
                                        setModalVisible(false)
                                        exist = true
                                        setInputValue('')
                                    }
                                    localtotal += pkt.precio * Number(pkt.cantidad)
                                }

                                if (exist) {
                                    for (const pkt of itemPackageSelected.products) {
                                        const pktQuantity = itemPackageSelected?.cantidad ? itemPackageSelected.cantidad : 0
                                        const item = totalInventary.find((i) => i.id_mob === pkt.fkid_inventario)

                                        const toRemove = pkt?.cantidad ? pkt.cantidad * oldQnty : 0

                                        const qtyPkt = pkt?.cantidad ? pkt.cantidad * pktQuantity : 0
                                        if (item) {
                                            item.cantidad_mob = String(toRemove)
                                            const cantidad = Number(item.cantidad_mob) - qtyPkt
                                            item.cantidad_mob = String(cantidad)
                                        }

                                        const itemInv = inventary.find((i) => i.id_mob === pkt.id_mob)
                                        if (itemInv) {
                                            itemInv.cantidad_mob = String(toRemove)
                                            const cantidad = Number(itemInv.cantidad_mob) - qtyPkt
                                            itemInv.cantidad_mob = String(cantidad)
                                        }
                                    }

                                    setTotal(localtotal)
                                    return
                                }

                                for (const pkt of itemPackageSelected.products) {
                                    const pktQuantity = itemPackageSelected?.cantidad ? itemPackageSelected.cantidad : 0
                                    const item = totalInventary.find((i) => i.id_mob === pkt.fkid_inventario)

                                    const qtyPkt = pkt?.cantidad ? pkt.cantidad * pktQuantity : 0
                                    if (item) {
                                        const cantidad = Number(item.cantidad_mob) - qtyPkt
                                        item.cantidad_mob = String(cantidad)
                                    }

                                    const itemInv = inventary.find((i) => i.id_mob === pkt.id_mob)
                                    if (itemInv) {
                                        const cantidad = Number(itemInv.cantidad_mob) - qtyPkt
                                        itemInv.cantidad_mob = String(cantidad)
                                    }
                                }

                                setPktSelected([...pktSelected, itemPackageSelected])
                                const cantidad = Number(itemPackageSelected.cantidad)
                                setTotal(total + itemPackageSelected.precio * cantidad)
                                setInputValue('')
                                setModalVisible(false)
                            }
                            const aval = { cantidad: 0 } as IAvailability
                            setItemSelected(aval)
                            setInputValue('')
                            setModalVisible(false)

                            const pkt = { cantidad: 0 } as IPackage
                            setItemPackageSelected(pkt)
                            setInputValue('')
                            setModalVisible(false)
                        }}
                        disabled={errorInput.length !== 0}
                        title="Agregar"
                    />
                    <PrimaryButton
                        containerStyle={{
                            flex: 1,
                            marginLeft: 8,
                            borderRadius: 14,
                            minHeight: 48,
                            paddingVertical: 12,
                            borderWidth: 1.5,
                            borderColor: `${colors.Morado100}66`,
                            backgroundColor: 'transparent',
                        }}
                        textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                        backgroundButton="transparent"
                        onPress={() => {
                            const aval = { cantidad: 0 } as IAvailability
                            setItemSelected(aval)
                            setInputValue('')
                            setModalVisible(false)

                            const pkt = { cantidad: 0 } as IPackage
                            setItemPackageSelected(pkt)
                            setInputValue('')
                            setModalVisible(false)
                        }}
                        title="Cerrar"
                    />
                </View>
            </AppModal>
        </View>
    )
}

export default Availability
