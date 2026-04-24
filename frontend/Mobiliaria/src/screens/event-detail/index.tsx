import { NavigationScreens } from "@interfaces/navigation";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import AppModal from "@components/AppModal"
import * as eventService from '../../services/events';
import { Linking } from "react-native";
import { useTheme } from "@hooks/useTheme";
import { IEventDetail, IInventaryRent, IPayment } from "@interfaces/event-details";
import Toast from "react-native-toast-message";
import * as paymentService from '../../services/payments';
import ConfirmDialog, { ConfirmDialogTone } from "@components/ConfirmDialog";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "@components/PrimaryButton";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SelectStreetMap from "@components/select-street-map";
import HistoryEvent from "@components/history";
import AppCard from "@components/AppCard";

/** Texto/icono sobre Morado, rojo, etc.; el token `colors.white` en modo oscuro del tema es #000. */
const LABEL_ON_SOLID = '#FFFFFF'

const EventDetail = ({
    route
}: StackScreenProps<NavigationScreens, 'EventDetail'>): JSX.Element => {

    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const id = route.params.id
    const [event, setEvent] = useState<IEventDetail>({} as IEventDetail)
    const [itemRemove, setItemRemove] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [abono, setAbono] = useState<string>('')
    const [flete, setFlete] = useState<string>('')
    const [obs, setObs] = useState<string>('')
    const [openAlert, setOpenAlert] = useState<number>(0)
    const [openEdit, setOpenEdit] = useState<boolean>(false)
    const [titular, SetTitular] = useState<string>('')
    const [telefono, SetTelefono] = useState<string>('')
    const [direccion, SetDireccion] = useState<string>('')
    const [openMap, setOpenMap] = useState<boolean>(false)
    const [seeHistory, setSeeHistory] = useState<boolean>(false)
    const [latLon, setLatLon] = useState<any>({})
    const [url, SetURL] = useState<string>('')
    const [detailTab, setDetailTab] = useState<'evento' | 'pagos' | 'material'>('evento')

    const { fonts, colors, layout } = useTheme()
    const insets = useSafeAreaInsets()

    const getDetails = async () => {
        try {
            const response = await eventService.getEventDetail(id) as IEventDetail

            SetTitular(response?.event?.nombre_titular_evento)
            SetTelefono(response?.event?.telefono_titular_evento)
            SetDireccion(response?.event?.direccion_evento)
            SetURL(response?.event?.url)

            setFlete(response?.event?.flete.toString())

            setObs(response?.event?.observaciones)

            setEvent(response)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const submitDirection = async () => {

        try {
            const body = {
                url: latLon.url,
                lat: latLon.lat,
                lng: latLon.lng
            }
            eventService.addDirection(event?.event?.id_evento, body)

        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        setLoading(true)
        getDetails()
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true)
            getDetails();
        });

        return unsubscribe;
    }, [navigation]);


    const keyExtractor = (item: IInventaryRent, index: number): string => item.id_mob.toString() + index

    const renderItem = ({
        item,
        index
    }: {
        item: IInventaryRent
        index: number
    }): JSX.Element => {
        return (
            <View style={styles.itemRow}>
                <View style={{ flex: 1, paddingRight: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <MaterialCommunityIcons name="cube-outline" size={20} color={colors.Morado100} style={{ marginRight: 10, marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.Griss50, fontFamily: fonts.Inter.SemiBold, fontSize: 15 }}>
                        {item.nombre_mob ? item.nombre_mob : item.nombre}
                        {item.package === 1 && (
                            <Text style={{ color: colors.gris400, fontFamily: fonts.Inter.Medium, fontSize: 12 }}> · paquete</Text>
                        )}
                    </Text>
                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                        {item.ocupados} rentado{item.ocupados !== 1 ? 's' : ''}
                    </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setItemRemove(item.id_mob)
                        setOpenAlert(3)
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.red} />
                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.red, marginLeft: 4 }}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const changeStatus = async () => {
        if (event?.event?.entregado === 0) {
            event.event.entregado = 1
            setEvent(event)
        } else if (event?.event?.recolectado === 0) {
            event.event.recolectado = 1
            setEvent(event)
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'El evento ya esta entregado y recolectado',
                visibilityTime: 1000,
                autoHide: true
            })
            return
        }

        try {
            await eventService.changeStatus(event?.event?.id_evento, event?.event?.entregado, event?.event?.recolectado)
            Toast.show({
                type: 'success',
                text1: 'Hecho',
                text2: 'se ha agregado la observacion',
                visibilityTime: 1000,
                autoHide: true
            })

        } catch (error) {
            console.log(error);
        }

    }

    const addItems = () => {
        navigation.navigate('Available', { date: event?.event?.fecha_envio_evento.split('T')[0], id: event?.event?.id_evento })
    }

    const removeEvent = async () => {
        try {
            console.log('event?.event?.id_evento', event?.event?.id_evento);
            
            setLoading(true)
            await eventService.removeEvent(event?.event?.id_evento)
            setLoading(false)
            Toast.show({
                type: 'success',
                text1: 'Hecho',
                text2: 'se ha eliminado el evento',
                visibilityTime: 1000,
                autoHide: true
            })
            navigation.navigate('Home', { refresh: false })
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }

    const removeItem = async () => {
        try {
            setLoading(true)
            await eventService.removeItem(event?.event?.id_evento, itemRemove)
            Toast.show({
                type: 'success',
                text1: 'Hecho',
                text2: 'Se ha eliminado',
                visibilityTime: 2000,
                autoHide: true
            })
            getDetails()
            setLoading(false)
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }

    const confirmDialog = useMemo(() => {
        if (openAlert === 1) {
            const pendingDelivery = event?.event?.entregado === 0
            return {
                headline: pendingDelivery ? 'Confirmar entrega' : 'Confirmar recolección',
                title: pendingDelivery
                    ? '¿Marcar este evento como entregado? Luego podrás registrar la recolección.'
                    : '¿Marcar este evento como recolectado?',
                confirmLabel: pendingDelivery ? 'Sí, entregar' : 'Sí, recolectar',
                tone: 'default' as ConfirmDialogTone,
            }
        }
        if (openAlert === 2) {
            return {
                headline: 'Eliminar evento',
                title:
                    'Se eliminará el evento y la información asociada en la app. Esta acción no se puede deshacer.',
                confirmLabel: 'Eliminar',
                tone: 'danger' as ConfirmDialogTone,
            }
        }
        if (openAlert === 3) {
            return {
                headline: 'Quitar material',
                title: 'Este artículo dejará de aparecer en el evento. ¿Deseas continuar?',
                confirmLabel: 'Quitar',
                tone: 'danger' as ConfirmDialogTone,
            }
        }
        return {
            headline: 'Confirmar',
            title: '¿Deseas continuar?',
            confirmLabel: 'Continuar',
            tone: 'default' as ConfirmDialogTone,
        }
    }, [openAlert, event?.event?.entregado])

    return (
        <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
            <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 + Math.max(insets.bottom, 12) }}
            >
                <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 12 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: `${colors.Griss50}12`,
                            borderRadius: 14,
                            padding: 4,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: `${colors.Griss50}18`,
                        }}
                    >
                        {(
                            [
                                { key: 'evento' as const, label: 'Evento', icon: 'calendar-star' },
                                { key: 'pagos' as const, label: 'Pagos', icon: 'cash-multiple' },
                                { key: 'material' as const, label: 'Material', icon: 'warehouse' },
                            ] as const
                        ).map(({ key, label, icon }) => {
                            const active = detailTab === key
                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setDetailTab(key)}
                                    activeOpacity={0.85}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 6,
                                        borderRadius: 11,
                                        backgroundColor: active ? colors.Morado600 : 'transparent',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={icon}
                                        size={18}
                                        color={active ? LABEL_ON_SOLID : colors.gris300}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontFamily: fonts.Inter.SemiBold,
                                            fontSize: 13,
                                            color: active ? LABEL_ON_SOLID : colors.gris300,
                                        }}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
                {detailTab === 'evento' && (
                <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 0 }}>
                    <AppCard>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <View
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: 44,
                                    backgroundColor: `${colors.Morado600}30`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}55`,
                                }}
                            >
                                <MaterialCommunityIcons name="calendar-star" size={44} color={colors.Morado100} />
                            </View>
                            <View style={{ flex: 1, paddingLeft: 14, paddingTop: 2 }}>
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, lineHeight: 28 }} numberOfLines={3}>
                                    {event?.event?.nombre_titular_evento}
                                </Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, marginTop: 8 }}>
                                    {event?.event?.nombre_evento}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <MaterialCommunityIcons name="phone-outline" size={18} color={colors.gris300} />
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, marginLeft: 6 }}>
                                        {event?.event?.telefono_titular_evento}
                                    </Text>
                                </View>
                                {Boolean(event?.event?.repartidor_nombre) && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                        <MaterialCommunityIcons name="truck-delivery-outline" size={18} color={colors.gris300} />
                                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, marginLeft: 6 }}>
                                            Repartidor: {event?.event?.repartidor_nombre}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => setOpenEdit(true)}
                                    style={{
                                        backgroundColor: colors.Morado600,
                                        borderRadius: 12,
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                        marginTop: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons name="pencil" size={18} color={LABEL_ON_SOLID} />
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: LABEL_ON_SOLID, marginLeft: 8 }}>
                                        Editar evento
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.Morado100} style={{ marginRight: 8, marginTop: 2 }} />
                                <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.Medium, fontSize: 15, lineHeight: 22, flex: 1 }}>
                                    {event?.event?.direccion_evento}
                                </Text>
                            </View>
                            {event?.event?.url && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(event?.event?.url ?? '')}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                                >
                                    <MaterialCommunityIcons name="open-in-new" size={18} color={colors.primario300} />
                                    <Text style={{ color: colors.primario300, fontFamily: fonts.Inter.SemiBold, fontSize: 14, marginLeft: 6 }} numberOfLines={2}>
                                        Ver en mapa
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.gris300} />
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, marginLeft: 8 }}>
                                    {event?.event?.fecha_envio_evento.split('T')[0]} · {event?.event?.hora_envio_evento}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 8 }}>
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: event?.event?.entregado === 0 ? colors.gris400 : colors.Morado600,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={event?.event?.entregado === 0 ? 'truck-delivery-outline' : 'truck-check'}
                                        size={22}
                                        color={LABEL_ON_SOLID}
                                    />
                                </View>
                                <View
                                    style={{
                                        marginLeft: 8,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 10,
                                        backgroundColor: event?.event?.entregado === 0 ? colors.gris400 : colors.Morado600,
                                    }}
                                >
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: LABEL_ON_SOLID }}>
                                        {event?.event?.entregado === 0 ? 'No entregado' : 'Entregado'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 8 }}>
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: event?.event?.recolectado === 0 ? colors.gris400 : colors.Morado600,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={event?.event?.recolectado === 0 ? 'package-variant' : 'package-variant-closed'}
                                        size={22}
                                        color={LABEL_ON_SOLID}
                                    />
                                </View>
                                <View
                                    style={{
                                        marginLeft: 8,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 10,
                                        backgroundColor: event?.event?.recolectado === 0 ? colors.gris400 : colors.Morado600,
                                    }}
                                >
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: LABEL_ON_SOLID }}>
                                        {event?.event?.recolectado === 0 ? 'No recolectado' : 'Recolectado'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setOpenAlert(1)}
                                style={{
                                    backgroundColor: colors.Morado600,
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    marginBottom: 8,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={event?.event?.entregado === 0 ? 'truck-fast' : 'archive-arrow-down'}
                                    size={18}
                                    color={LABEL_ON_SOLID}
                                />
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: LABEL_ON_SOLID, marginLeft: 8 }}>
                                    {event?.event?.entregado === 0 ? 'Entregar' : 'Recolectar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 8, flexWrap: 'wrap' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                                <MaterialCommunityIcons
                                    name={seeHistory ? 'history' : 'text-box-outline'}
                                    size={24}
                                    color={colors.Morado100}
                                />
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 18, color: colors.Griss50, marginLeft: 8 }}>
                                    {seeHistory ? 'Historial' : 'Observaciones'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {!seeHistory && (
                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (obs === event.event.observaciones) {
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Error',
                                                    text2: 'No hay cambios en las observaciones',
                                                    visibilityTime: 1000,
                                                    autoHide: true,
                                                })
                                                return
                                            }
                                            setLoading(true)
                                            try {
                                                await eventService.addObservation(obs, event?.event?.id_evento)
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Hecho',
                                                    text2: 'se ha agregado la observacion',
                                                    visibilityTime: 1000,
                                                    autoHide: true,
                                                })
                                                getDetails()
                                            } catch (error) {
                                                console.log(error)
                                                setLoading(false)
                                            }
                                        }}
                                        style={{
                                            backgroundColor: colors.Morado600,
                                            alignItems: 'center',
                                            borderRadius: 10,
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            marginLeft: 8,
                                            marginBottom: 4,
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <MaterialCommunityIcons name="note-plus-outline" size={16} color={LABEL_ON_SOLID} />
                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: LABEL_ON_SOLID, marginLeft: 6 }}>Agregar obs.</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={async () => {
                                        setSeeHistory(!seeHistory)
                                    }}
                                    style={{
                                        backgroundColor: colors.Morado100,
                                        alignItems: 'center',
                                        borderRadius: 10,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        marginLeft: 8,
                                        marginBottom: 4,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={seeHistory ? 'comment-outline' : 'history'}
                                        size={16}
                                        color={LABEL_ON_SOLID}
                                    />
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: LABEL_ON_SOLID, marginLeft: 6 }}>
                                        {seeHistory ? 'Ver observaciones' : 'Historial'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {!seeHistory ? (
                            <View
                                style={{
                                    backgroundColor: `${colors.Griss50}10`,
                                    width: '100%',
                                    minHeight: 40,
                                    borderRadius: 12,
                                    marginTop: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderWidth: 1,
                                    borderColor: `${colors.Griss50}18`,
                                }}
                            >
                                <TextInput
                                    placeholder="Agrega observaciones aquí"
                                    placeholderTextColor={colors.gris400}
                                    onChangeText={setObs}
                                    value={obs}
                                    style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, paddingVertical: 4 }}
                                />
                            </View>
                        ) : (
                            <View style={{ marginTop: 8 }}>
                                <HistoryEvent historial={event.historial} />
                            </View>
                        )}
                    </AppCard>
                </View>
                )}
                {detailTab === 'pagos' && (
                    <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 0 }}>
                        {event?.payments && event.payments.length > 0 ? (
                        <AppCard>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <MaterialCommunityIcons name="cash-multiple" size={26} color={colors.Morado100} />
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, marginLeft: 10 }}>
                                    Seguimiento al pago
                                </Text>
                            </View>
                            <View style={{ flexDirection: layout.isTablet ? 'row' : 'column', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.gris300, lineHeight: 20 }}>
                                        <Text style={{ fontFamily: fonts.Inter.Medium, color: colors.Morado100 }}>IVA: </Text>
                                        {event?.event?.iva === 1 ? 'Sí' : 'No'}
                                        <Text style={{ fontFamily: fonts.Inter.Medium, color: colors.Morado100 }}> · Descuento: </Text>
                                        {event?.event?.descuento}
                                        <Text style={{ fontFamily: fonts.Inter.Medium, color: colors.Morado100 }}> · Flete: </Text>
                                        {event?.event?.flete}
                                    </Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, marginTop: 10 }}>
                                        Costo del evento: {event?.payments[event?.payments.length - 1]?.costo_total.toFixed(2)}
                                    </Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, marginTop: 4 }}>
                                        Anticipo: {event?.payments[event?.payments.length - 1]?.anticipo}
                                    </Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, marginTop: 4 }}>
                                        Saldo al corte: {event?.payments[event?.payments.length - 1]?.saldo.toFixed(2)}
                                    </Text>
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, marginTop: 12, fontSize: 15, color: colors.Griss50 }}>Abonos</Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, marginTop: 4 }}>
                                        {event?.payments.map((item, index) => {
                                            const comma = index !== event?.payments.length + 1 ? ', ' : ''
                                            if (!item.abono) return
                                            return item.abono + comma
                                        })}
                                    </Text>
                                    <TextInput
                                        placeholder="Ingrese abono"
                                        placeholderTextColor={colors.gris400}
                                        onChangeText={setAbono}
                                        style={{
                                            width: '100%',
                                            marginTop: 10,
                                            paddingVertical: 10,
                                            paddingHorizontal: 12,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: `${colors.Griss50}22`,
                                            fontFamily: fonts.Inter.Regular,
                                            fontSize: 13,
                                            color: colors.Griss50,
                                            backgroundColor: `${colors.Griss50}08`,
                                        }}
                                    />
                                    <TouchableOpacity
                                        disabled={abono.length === 0}
                                        onPress={async () => {
                                            if (Number(abono) > event?.payments[event?.payments.length - 1]?.saldo) {
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Error',
                                                    text2: 'El abono es mayor al saldo',
                                                    visibilityTime: 1000,
                                                    autoHide: true,
                                                })
                                                return
                                            }
                                            setLoading(true)
                                            const body = {
                                                saldo: event?.payments[event?.payments.length - 1]?.saldo - Number(abono),
                                                abono: Number(abono),
                                                id_evento: event?.event?.id_evento,
                                                total: event?.payments[event?.payments.length - 1]?.costo_total,
                                                anticipo: event?.payments[event?.payments.length - 1]?.anticipo,
                                            }
                                            try {
                                                await paymentService.addPayment(body)
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Hecho',
                                                    text2: 'se ha abonado al evento',
                                                    visibilityTime: 1000,
                                                    autoHide: true,
                                                })
                                                getDetails()
                                            } catch (error) {
                                                console.log(error)
                                                setLoading(false)
                                            }
                                        }}
                                        style={{
                                            backgroundColor: abono.length !== 0 ? colors.Morado600 : colors.gray500,
                                            alignItems: 'center',
                                            marginTop: 10,
                                            borderRadius: 10,
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                        }}
                                    >
                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: LABEL_ON_SOLID }}>Agregar abono</Text>
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 60,
                                        backgroundColor: `${colors.Morado600}22`,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: `${colors.Morado100}33`,
                                        marginTop: layout.isTablet ? 0 : 14,
                                        alignSelf: layout.isTablet ? 'auto' : 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons name="chart-timeline-variant" size={56} color={colors.Morado100} />
                                </View>
                            </View>
                            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                                <TextInput
                                    placeholder="Ingrese flete"
                                    placeholderTextColor={colors.gris400}
                                    onChangeText={setFlete}
                                    value={flete}
                                    style={{
                                        width: '100%',
                                        paddingVertical: 10,
                                        paddingHorizontal: 12,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: `${colors.Griss50}22`,
                                        fontFamily: fonts.Inter.Regular,
                                        fontSize: 13,
                                        color: colors.Griss50,
                                        backgroundColor: `${colors.Griss50}08`,
                                    }}
                                />
                                <TouchableOpacity
                                    disabled={flete.length === 0}
                                    onPress={async () => {
                                        try {
                                            setLoading(true)
                                            const body = { flete: Number(flete) }
                                            await paymentService.addFlete(body, event?.event?.id_evento)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Hecho',
                                                text2: 'se ha agregado el flete',
                                                visibilityTime: 1000,
                                                autoHide: true,
                                            })
                                            getDetails()
                                        } catch (error) {
                                            console.log(error)
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                    style={{
                                        backgroundColor: flete.length !== 0 ? colors.Morado600 : colors.gray500,
                                        alignItems: 'center',
                                        marginTop: 10,
                                        borderRadius: 10,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: LABEL_ON_SOLID }}>Agregar flete</Text>
                                </TouchableOpacity>
                            </View>
                        </AppCard>
                        ) : (
                            <AppCard>
                                <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 }}>
                                    <MaterialCommunityIcons name="cash-off" size={48} color={colors.gris400} />
                                    <Text
                                        style={{
                                            fontFamily: fonts.Inter.SemiBold,
                                            fontSize: 17,
                                            color: colors.Griss50,
                                            marginTop: 14,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Sin seguimiento de pago
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: fonts.Inter.Regular,
                                            fontSize: 14,
                                            color: colors.gris300,
                                            marginTop: 8,
                                            textAlign: 'center',
                                        }}
                                    >
                                        No hay información de pagos para este evento todavía.
                                    </Text>
                                </View>
                            </AppCard>
                        )}
                    </View>
                )}
                {detailTab === 'material' && (
                <View style={{ paddingHorizontal: layout.contentHorizontalPadding, paddingTop: 0, paddingBottom: 24 }}>
                    <AppCard>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <MaterialCommunityIcons name="warehouse" size={26} color={colors.Morado100} />
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, marginLeft: 10 }}>
                                Material
                            </Text>
                        </View>
                        <FlatList
                            scrollEnabled={false}
                            nestedScrollEnabled
                            ItemSeparatorComponent={() => (
                                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: `${colors.Griss50}18` }} />
                            )}
                            data={event?.items}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            ListFooterComponent={() => (
                                <TouchableOpacity onPress={addItems} style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 16, flexDirection: 'row' }}>
                                    <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.primario300} />
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, color: colors.primario300, fontSize: 16, marginLeft: 8 }}>
                                        Agregar material
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </AppCard>
                </View>
                )}
            </ScrollView>
            <TouchableOpacity
                onPress={() => setOpenAlert(2)}
                activeOpacity={0.85}
                style={{
                    width: '100%',
                    minHeight: 52,
                    paddingBottom: Math.max(insets.bottom, 10),
                    paddingTop: 12,
                    backgroundColor: colors.red,
                    borderTopWidth: 1,
                    borderTopColor: `${colors.Griss50}33`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    position: 'absolute',
                    bottom: 0,
                }}
            >
                <MaterialCommunityIcons name="delete-outline" size={22} color={LABEL_ON_SOLID} />
                <Text style={{ fontFamily: fonts.Inter.SemiBold, color: LABEL_ON_SOLID, fontSize: 17, marginLeft: 10 }}>Eliminar evento</Text>
            </TouchableOpacity>
            {loading && (
                <View style={styles.loadingOverlay} pointerEvents="auto">
                    <ActivityIndicator size="large" color={colors.Morado600} />
                </View>
            )}
            <Toast />
            <ConfirmDialog
                open={openAlert !== 0}
                headline={confirmDialog.headline}
                title={confirmDialog.title}
                confirmLabel={confirmDialog.confirmLabel}
                tone={confirmDialog.tone}
                sure={() => {
                    if (openAlert === 1) {
                        changeStatus()
                    } else if (openAlert === 2) {
                        removeEvent()
                    } else {
                        removeItem()
                    }
                    setOpenAlert(0)
                }}
                notsure={() => {
                    setItemRemove(0)
                    setOpenAlert(0)
                }}
            />
            <View style={{ flex: 1 }}>
                <SelectStreetMap open={openMap} props={(p: any) => {
                    console.log('p', p);
                    
                if (!p) {
                    setOpenEdit(true);
                    setOpenMap(false)
                    return 
                } 
                setLatLon(p)
                if (p.direccion) SetDireccion(p.description)
                
                setOpenMap(false)
                setOpenEdit(true)
                }}></SelectStreetMap>

            </View>
            <View>
                <AppModal
                    visible={openEdit}
                    onRequestClose={() => setOpenEdit(false)}
                    animationType="fade"
                    keyboardAvoiding
                    maxHeight={layout.modalMaxHeight}
                >
                        <View
                            style={{
                                borderRadius: 16,
                            }}
                        >
                            <ScrollView
                                style={{ paddingHorizontal: 18, paddingTop: 18 }}
                                contentContainerStyle={{ paddingBottom: 12 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="account-edit-outline" size={30} color={colors.Morado100} />
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, marginLeft: 10 }}>
                                        Editar evento
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        alignSelf: 'flex-start',
                                        marginTop: 12,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 999,
                                        backgroundColor: `${colors.Morado600}33`,
                                        borderWidth: 1,
                                        borderColor: `${colors.Morado100}44`,
                                    }}
                                >
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.Morado100 }}>
                                        Datos de contacto y ubicación
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>Titular</Text>
                                <View
                                    style={{
                                        backgroundColor: `${colors.Griss50}0C`,
                                        width: '100%',
                                        borderRadius: 12,
                                        marginTop: 8,
                                        paddingHorizontal: 14,
                                        borderWidth: 1,
                                        borderColor: `${colors.Morado100}44`,
                                    }}
                                >
                                    <TextInput
                                        keyboardType="default"
                                        value={titular}
                                        onChangeText={SetTitular}
                                        placeholder="Nombre del titular"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: 12 }}
                                    />
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>Teléfono</Text>
                                <View
                                    style={{
                                        backgroundColor: `${colors.Griss50}0C`,
                                        width: '100%',
                                        borderRadius: 12,
                                        marginTop: 8,
                                        paddingHorizontal: 14,
                                        borderWidth: 1,
                                        borderColor: `${colors.Morado100}44`,
                                    }}
                                >
                                    <TextInput
                                        keyboardType="phone-pad"
                                        value={telefono}
                                        onChangeText={SetTelefono}
                                        placeholder="Teléfono de contacto"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: 12 }}
                                    />
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>Dirección</Text>
                                <View
                                    style={{
                                        backgroundColor: `${colors.Griss50}0C`,
                                        width: '100%',
                                        borderRadius: 12,
                                        marginTop: 8,
                                        paddingHorizontal: 14,
                                        borderWidth: 1,
                                        borderColor: `${colors.Morado100}44`,
                                    }}
                                >
                                    <TextInput
                                        keyboardType="default"
                                        value={direccion}
                                        onChangeText={SetDireccion}
                                        placeholder="Dirección del evento"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: 12 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setOpenEdit(false)
                                        setOpenMap(!openMap)
                                    }}
                                    style={{
                                        backgroundColor: colors.Morado600,
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                        marginTop: 16,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <MaterialCommunityIcons name="map-search-outline" size={20} color={LABEL_ON_SOLID} />
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: LABEL_ON_SOLID, marginLeft: 8 }}>
                                        Modificar mapa{latLon && latLon.lat ? ' · listo' : ''}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                            <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 }}>
                                <PrimaryButton
                                    containerStyle={{
                                        width: '100%',
                                        paddingVertical: 14,
                                        borderRadius: 14,
                                        minHeight: 50,
                                        marginBottom: 10,
                                    }}
                                    textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: LABEL_ON_SOLID }}
                                    backgroundButton={colors.Morado600}
                                    onPress={() => {
                                        setLoading(true)
                                        setOpenEdit(false)
                                        submitDirection()
                                        eventService
                                            .editEvent(event?.event?.id_evento, titular, telefono, direccion)
                                            .then(() => {
                                                getDetails()
                                                setOpenEdit(false)
                                            })
                                            .catch(error => {
                                                console.log(error)
                                                setLoading(false)
                                            })
                                    }}
                                    title="Guardar cambios"
                                />
                                <PrimaryButton
                                    containerStyle={{
                                        width: '100%',
                                        paddingVertical: 14,
                                        borderRadius: 14,
                                        minHeight: 50,
                                        borderWidth: 1.5,
                                        borderColor: `${colors.Morado100}66`,
                                        backgroundColor: 'transparent',
                                    }}
                                    textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                                    backgroundButton="transparent"
                                    onPress={() => setOpenEdit(false)}
                                    title="Cancelar"
                                />
                            </View>
                        </View>
                </AppModal>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.56)',
    },
})

export default EventDetail
