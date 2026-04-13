import { NavigationScreens } from '@interfaces/navigation'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { useMemo, useState } from 'react'
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import Loading from '@components/loading'
import LottieView from 'lottie-react-native'
import React from 'react'
import { useTheme } from '@hooks/useTheme'
import { IAvailability } from '@interfaces/availability'
import { useNavigation } from '@react-navigation/native'
import useReduxEvent from '@hooks/useEvent'
import DatePickerComponent from '@components/datepicker'
import Toast from 'react-native-toast-message'
import * as eventService from '@services/events'
import ConfirmDialog from '@components/ConfirmDialog'
import RNPickerSelect from 'react-native-picker-select'
import SelectStreetMap from '@components/select-street-map'
import MultiSelect from 'react-native-multiple-select'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AppCard from '@components/AppCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createAppPickerSelectStyle } from '@utils/pickerSelectTheme'

export enum ETypesPicker {
    Recolection = 1,
    HourRecolection = 2,
    Delivery = 3,
    HourDelivery = 4,
}

const LABEL_ON_SOLID = '#FFFFFF'

type AccordionKey = 'datos' | 'ubicacion' | 'recurrente' | 'fechas' | 'cobro' | 'material'

const AddEvent = ({ route }: StackScreenProps<NavigationScreens, 'AddEvent'>): JSX.Element => {
    const date = route.params.date
    const arrDate = date.split('-')
    const formatDate = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`

    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const insets = useSafeAreaInsets()
    const [openAddress, setOpenAddress] = useState<boolean>(false)
    const [latlon, setLatLon] = useState<any>({ url: '', lat: 'none', lng: 'none' })
    const [loading, setLoading] = useState<boolean>(false)
    const { inventaryRx, totalRx, packagesRx } = useReduxEvent()
    const [total, setTotal] = useState<number>(totalRx)
    const [persentage, setPersentage] = useState<string>('0')
    const [flete, setFlete] = useState<string>('0')
    const [iva, setIva] = useState<boolean>(false)
    const [openModalPicker, setOpenModalPicker] = useState<boolean>(false)
    const [toggleSwitch, setToggleSwitch] = useState<boolean>(false)
    const [togglePaymenthSwitch, setTogglePaymenthSwitch] = useState<boolean>(false)

    const [typePicker, setTypePicker] = useState<{ type: number; mode: 'date' | 'time' | 'datetime' }>({
        type: ETypesPicker.Recolection,
        mode: 'date',
    })
    const [recolectedDay, setRecolectedDay] = useState<{ date: string; hour: string }>({ date: date, hour: '9:00' })
    const [deliveredDay, setDeliveredDay] = useState<{ date: string; hour: string }>({ date: date, hour: '9:00' })
    const [notificationRecolection, setNotificationRecolection] = useState<string>('0')
    const [notificationSend, setNotificationSend] = useState<string>('0')
    const [anticipo, SetAnticipo] = useState<string>('')
    const [detailsEvent, setDetailsEvent] = useState<{
        titular: string
        tipo: string
        telefono: string
        direccion: string
        nombreEvento: string
    }>({ nombreEvento: 'otro', titular: '', tipo: '', telefono: '', direccion: '' })
    const [openAlert, setOpenAlert] = useState<boolean>(false)
    const [selectedItems, setSelectedItems] = useState([])
    const [recTime, setRecTime] = useState<number>(0)

    const [accordion, setAccordion] = useState<Record<AccordionKey, boolean>>({
        datos: true,
        ubicacion: true,
        recurrente: false,
        fechas: true,
        cobro: true,
        material: true,
    })

    const toggleAccordion = (key: AccordionKey): void => {
        setAccordion((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const animation = React.useRef<LottieView>(null)

    const { fonts, colors } = useTheme()

    const inputWrap = {
        backgroundColor: `${colors.Griss50}0C`,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${colors.Morado100}44`,
        paddingHorizontal: 14,
        marginTop: 8,
    } as const

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

    const submit = async () => {
        if ((toggleSwitch && recTime === 0) || (toggleSwitch && selectedItems.length === 0)) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Faltan datos para el evento recurrente',
                visibilityTime: 1000,
                autoHide: true,
                onHide: () => {},
            })
            return
        }

        if (inventaryRx.length === 0 && packagesRx.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No hay material agregado',
                visibilityTime: 1000,
                autoHide: true,
                onHide: () => {},
            })
            return
        }

        if (detailsEvent.titular === '') {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Faltan el nombre del titular',
                visibilityTime: 1000,
                autoHide: true,
                onHide: () => {},
            })
            return
        }
        setLoading(true)

        const recDateArr = recolectedDay.date.split('-')
        const recDate = `${recDateArr[2]}-${recDateArr[1]}-${recDateArr[0]}`

        const event: any = {
            nombre_evento: detailsEvent.nombreEvento,
            tipo_evento: detailsEvent.tipo.length === 0 ? 'otro' : detailsEvent.tipo,
            fecha_envio_evento: date,
            hora_envio_evento: deliveredDay.hour ? deliveredDay.hour : '9:00',
            fecha_recoleccion_evento: recolectedDay.date ? recDate : date,
            hora_recoleccion_evento: recolectedDay.hour ? recolectedDay.hour : '9:00',
            nombre_titular_evento: detailsEvent.titular,
            direccion_evento: detailsEvent.direccion ? detailsEvent.direccion : 'Sin direccion',
            telefono_titular_evento: detailsEvent.telefono.length === 0 ? '0000000000' : detailsEvent.telefono,
            descuento: persentage ? parseInt(persentage, 10) : 0,
            ivavalor: iva ? 1 : 0,
            fletevalor: flete ? Number(flete) : 0,
            maps: latlon,
        }

        event.pagado_evento = Number(anticipo) === total ? 1 : 0

        const mobiliario: any[] = []

        inventaryRx.forEach((item: IAvailability) => {
            mobiliario.push({
                fecha_evento: date,
                hora_evento: deliveredDay.hour,
                id_mob: item.id_mob,
                ocupados: item.cantidad,
                hora_recoleccion: recolectedDay.hour,
                costo: item.costo_mob,
            })
        })

        const localAnticipo = anticipo ? Number(anticipo) : 0
        const costo = {
            costo_total: total,
            anticipo: localAnticipo,
            saldo: total - localAnticipo,
        }

        const body = {
            evento: event,
            mobiliario: mobiliario,
            paquetes: packagesRx,
            costo,
            rec: false,
            notifications: {
                send: notificationSend,
                recolected: notificationRecolection,
            },
        }

        try {
            await eventService.addEvent(body)
            if (toggleSwitch) {
                Toast.show({
                    type: 'info',
                    text1: 'Estamos preparando tus eventos recurrentes',
                    text2: 'ten paciencia, esto nos puede tomar mas tiempo',
                    visibilityTime: 15000,
                    autoHide: true,
                })
                await eventService.addRecurrentEvent(body, recTime, selectedItems, parseDateString(date), togglePaymenthSwitch)
            }

            navigation.navigate('Home', { refresh: true })
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const parseDateString = (dateString: string) => {
        let day: number
        let month: number
        let year: number
        const dateArr = dateString.split('-')
        if (dateArr[0].length === 2) {
            day = Number(dateArr[0])
            month = Number(dateArr[1])
            year = Number(dateArr[2])
        } else {
            day = Number(dateArr[2])
            month = Number(dateArr[1])
            year = Number(dateArr[0])
        }

        return new Date(year, month - 1, day)
    }

    const changeDate = (days: number) => {
        let localDate = date
        if (date.split('-')[0].length === 2) {
            const dateEnv = date.split('-')
            localDate = `${dateEnv[2]}-${dateEnv[1]}-${dateEnv[0]}`
        }
        const olddate = new Date(localDate)
        olddate.setDate(olddate.getDate() + days)
        const arr = olddate.toISOString().split('T')[0]
        const arrD = arr.split('-')
        return `${arrD[2]}-${arrD[1]}-${arrD[0]}`
    }

    const onSelectedItemsChange = (items: any) => {
        setSelectedItems(items)
    }

    const hourItems = [
        { label: '9:00', value: '9:00' },
        { label: '10:00', value: '10:00' },
        { label: '11:00', value: '11:00' },
        { label: '12:00', value: '12:00' },
        { label: '13:00', value: '13:00' },
        { label: '14:00', value: '14:00' },
        { label: '15:00', value: '15:00' },
        { label: '16:00', value: '16:00' },
        { label: '17:00', value: '17:00' },
        { label: '18:00', value: '18:00' },
        { label: '19:00', value: '19:00' },
        { label: '20:00', value: '20:00' },
        { label: '21:00', value: '21:00' },
        { label: '22:00', value: '22:00' },
    ]

    const notifyItems = [
        { label: 'nunca', value: '0' },
        { label: '1 hora antes', value: '1h' },
        { label: '5 horas antes', value: '5h' },
        { label: '1 dia antes', value: '1d' },
        { label: '1 semana antes', value: '1s' },
        { label: '1 mes antes', value: '1m' },
    ]

    const footerH = 150 + Math.max(insets.bottom, 12)
    const mapUrlReady = latlon?.url != null && String(latlon.url).length > 0

    return (
        <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: footerH, paddingTop: 8 }}
            >
                <View style={{ paddingHorizontal: 16 }}>
                    <AppCard style={{ padding: 0 }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => toggleAccordion('datos')}
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
                        >
                            <MaterialCommunityIcons
                                name={accordion.datos ? 'chevron-up' : 'chevron-down'}
                                size={22}
                                color={colors.Morado100}
                                style={{ marginRight: 8 }}
                            />
                            <MaterialCommunityIcons name="calendar-star" size={24} color={colors.Morado100} style={{ marginRight: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Datos del evento</Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }} numberOfLines={2}>
                                    Envío {formatDate}
                                    {detailsEvent.titular ? ` · ${detailsEvent.titular}` : ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {accordion.datos ? (
                            <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <LottieView
                                        ref={animation}
                                        autoPlay
                                        loop
                                        style={{ width: 64, height: 64, marginRight: 12 }}
                                        source={require('../../assets/images/lottie/event.json')}
                                    />
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>Titular</Text>
                                <View style={inputWrap}>
                                    <TextInput
                                        onChangeText={(value: string) => setDetailsEvent({ ...detailsEvent, titular: value })}
                                        placeholder="Nombre"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }}
                                    />
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 14 }}>Tipo de evento</Text>
                                <View style={inputWrap}>
                                    <TextInput
                                        onChangeText={(value: string) => setDetailsEvent({ ...detailsEvent, tipo: value })}
                                        placeholder="Ej. boda, XV años…"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }}
                                    />
                                </View>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 14 }}>Teléfono</Text>
                                <View style={inputWrap}>
                                    <TextInput
                                        keyboardType="phone-pad"
                                        onChangeText={(value: string) => setDetailsEvent({ ...detailsEvent, telefono: value })}
                                        placeholder="Teléfono de contacto"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }}
                                    />
                                </View>
                            </View>
                        ) : null}
                    </AppCard>

                    <AppCard style={{ marginTop: 12, padding: 0 }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => toggleAccordion('ubicacion')}
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
                        >
                            <MaterialCommunityIcons
                                name={accordion.ubicacion ? 'chevron-up' : 'chevron-down'}
                                size={22}
                                color={colors.Morado100}
                                style={{ marginRight: 8 }}
                            />
                            <MaterialCommunityIcons name="map-marker-outline" size={24} color={colors.Morado100} style={{ marginRight: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Ubicación</Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }} numberOfLines={2}>
                                    {detailsEvent.direccion ? detailsEvent.direccion : 'Dirección y mapa'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {accordion.ubicacion ? (
                            <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                        <View style={inputWrap}>
                            <TextInput
                                placeholder="Dirección del evento"
                                placeholderTextColor={colors.gris400}
                                onChangeText={(value: string) => setDetailsEvent({ ...detailsEvent, direccion: value })}
                                style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, minHeight: 44, paddingVertical: 8 }}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => setOpenAddress(true)}
                            activeOpacity={0.88}
                            style={{
                                marginTop: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.Morado600,
                                borderRadius: 12,
                                paddingVertical: 12,
                            }}
                        >
                            <MaterialCommunityIcons name="map-search-outline" size={20} color={LABEL_ON_SOLID} />
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: LABEL_ON_SOLID, marginLeft: 8 }}>
                                Ubicar en el mapa
                            </Text>
                        </TouchableOpacity>
                        {mapUrlReady && (
                            <TouchableOpacity onPress={() => Linking.openURL(latlon.url)} style={{ marginTop: 10 }}>
                                <Text
                                    style={{
                                        fontFamily: fonts.Inter.Regular,
                                        fontSize: 12,
                                        color: colors.primario300,
                                    }}
                                    numberOfLines={2}
                                >
                                    {latlon.url}
                                </Text>
                            </TouchableOpacity>
                        )}
                            </View>
                        ) : null}
                    </AppCard>

                    <AppCard style={{ marginTop: 12, padding: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={() => toggleAccordion('recurrente')}
                                style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
                            >
                                <MaterialCommunityIcons
                                    name={accordion.recurrente ? 'chevron-up' : 'chevron-down'}
                                    size={22}
                                    color={colors.Morado100}
                                    style={{ marginRight: 8 }}
                                />
                                <MaterialCommunityIcons name="calendar-repeat" size={22} color={colors.Morado100} />
                                <View style={{ marginLeft: 8, flex: 1 }}>
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}>Evento recurrente</Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 2 }}>
                                        {toggleSwitch ? 'Activado' : 'Desactivado'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <Switch
                                trackColor={{ false: colors.gris400, true: `${colors.Morado600}99` }}
                                thumbColor={toggleSwitch ? colors.Morado600 : colors.gris300}
                                ios_backgroundColor={colors.gris400}
                                onValueChange={setToggleSwitch}
                                value={toggleSwitch}
                            />
                        </View>
                        {accordion.recurrente ? (
                            <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                                {!toggleSwitch ? (
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, paddingVertical: 10 }}>
                                        Activa el interruptor arriba a la derecha para elegir días y duración de la recurrencia.
                                    </Text>
                                ) : (
                                    <>
                                        <MultiSelect
                                            items={[
                                                { id: 1, name: 'Lunes' },
                                                { id: 2, name: 'Martes' },
                                                { id: 3, name: 'Miercoles' },
                                                { id: 4, name: 'Jueves' },
                                                { id: 5, name: 'Viernes' },
                                                { id: 6, name: 'Sabado' },
                                                { id: 0, name: 'Domingo' },
                                            ]}
                                            uniqueKey="id"
                                            onSelectedItemsChange={onSelectedItemsChange}
                                            selectedItems={selectedItems}
                                            selectText="Días que se repite"
                                            searchInputPlaceholderText="dias"
                                            submitButtonText="Aceptar"
                                            submitButtonColor={colors.Morado600}
                                            tagBorderColor={colors.Morado100}
                                            tagTextColor={colors.Griss50}
                                            selectedItemTextColor={colors.Morado600}
                                            selectedItemIconColor={colors.Morado600}
                                        />
                                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12, marginBottom: 6 }}>
                                            Tiempo de recurrencia
                                        </Text>
                                        <View style={[inputWrap, { marginTop: 0 }]}>
                                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                                placeholder={{ label: 'Selecciona el tiempo', value: null }}
                                                value={recTime}
                                                onValueChange={(value) => setRecTime(value as number)}
                                                items={[
                                                    { label: 'nada', value: 0 },
                                                    { label: '1 mes', value: 1 },
                                                    { label: '2 meses', value: 2 },
                                                    { label: '3 meses', value: 3 },
                                                    { label: '4 meses', value: 4 },
                                                    { label: '5 meses', value: 5 },
                                                    { label: '6 meses', value: 6 },
                                                    { label: '7 meses', value: 7 },
                                                    { label: '8 meses', value: 8 },
                                                    { label: '9 meses', value: 9 },
                                                    { label: '10 meses', value: 10 },
                                                    { label: '11 meses', value: 11 },
                                                    { label: '12 meses', value: 12 },
                                                    { label: '13 meses', value: 13 },
                                                    { label: '14 meses', value: 14 },
                                                ]}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                                            <Switch
                                                trackColor={{ false: colors.gris400, true: `${colors.Morado600}99` }}
                                                thumbColor={togglePaymenthSwitch ? colors.Morado600 : colors.gris300}
                                                ios_backgroundColor={colors.gris400}
                                                onValueChange={setTogglePaymenthSwitch}
                                                value={togglePaymenthSwitch}
                                            />
                                            <Text
                                                style={{
                                                    fontFamily: fonts.Inter.Regular,
                                                    fontSize: 14,
                                                    color: togglePaymenthSwitch ? colors.Morado100 : colors.gris300,
                                                    marginLeft: 10,
                                                }}
                                            >
                                                Evento pagado (recurrente)
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        ) : null}
                    </AppCard>

                    <AppCard style={{ marginTop: 12, padding: 0 }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => toggleAccordion('fechas')}
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
                        >
                            <MaterialCommunityIcons
                                name={accordion.fechas ? 'chevron-up' : 'chevron-down'}
                                size={22}
                                color={colors.Morado100}
                                style={{ marginRight: 8 }}
                            />
                            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.Morado100} style={{ marginRight: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Fechas y avisos</Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }} numberOfLines={2}>
                                    Entrega · recolección · notificaciones
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {accordion.fechas ? (
                            <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300 }}>Fecha de entrega</Text>
                        <View style={[inputWrap, { opacity: 0.85 }]}>
                            <TextInput editable={false} value={date} style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.gris300, paddingVertical: 10 }} />
                        </View>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12 }}>Hora de entrega</Text>
                        <View style={inputWrap}>
                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                placeholder={{ label: 'Selecciona la hora', value: null }}
                                onValueChange={(value) => setDeliveredDay({ ...deliveredDay, hour: value as string })}
                                items={hourItems}
                            />
                        </View>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12 }}>Aviso antes de entrega</Text>
                        <View style={inputWrap}>
                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                placeholder={{ label: 'Selecciona', value: null }}
                                onValueChange={(value) => setNotificationSend(value as string)}
                                items={notifyItems}
                            />
                        </View>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12 }}>Fecha de recolección</Text>
                        <View style={inputWrap}>
                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                placeholder={{ label: 'Selecciona', value: null }}
                                onValueChange={(value) => setRecolectedDay({ ...recolectedDay, date: value as string })}
                                items={[
                                    { label: changeDate(0), value: changeDate(0) },
                                    { label: changeDate(1), value: changeDate(1) },
                                    { label: changeDate(2), value: changeDate(2) },
                                    { label: changeDate(3), value: changeDate(3) },
                                ]}
                            />
                        </View>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12 }}>Hora de recolección</Text>
                        <View style={inputWrap}>
                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                placeholder={{ label: 'Selecciona la hora', value: null }}
                                onValueChange={(value) => setRecolectedDay({ ...recolectedDay, hour: value as string })}
                                items={hourItems}
                            />
                        </View>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12 }}>Aviso antes de recolección</Text>
                        <View style={inputWrap}>
                            <RNPickerSelect {...pickerCommon} Icon={PickerChevron}
                                placeholder={{ label: 'Selecciona', value: null }}
                                onValueChange={(value) => setNotificationRecolection(value as string)}
                                items={notifyItems}
                            />
                        </View>
                            </View>
                        ) : null}
                    </AppCard>

                    <AppCard style={{ marginTop: 12, padding: 0 }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => toggleAccordion('cobro')}
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
                        >
                            <MaterialCommunityIcons
                                name={accordion.cobro ? 'chevron-up' : 'chevron-down'}
                                size={22}
                                color={colors.Morado100}
                                style={{ marginRight: 8 }}
                            />
                            <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.Morado100} style={{ marginRight: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Cobro</Text>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }} numberOfLines={1}>
                                    IVA · descuento · flete · anticipo
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {accordion.cobro ? (
                            <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <CheckBox value={iva} onValueChange={setIva} tintColors={{ true: colors.Morado600, false: colors.gris400 }} />
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 14, color: colors.Griss50, marginLeft: 8 }}>Aplicar IVA</Text>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <View style={{ flex: 1, minWidth: 120, marginRight: 8, marginBottom: 8 }}>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300 }}>% Descuento</Text>
                                <View style={[inputWrap, { marginTop: 6 }]}>
                                    <TextInput
                                        onChangeText={setPersentage}
                                        value={persentage}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: 10 }}
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1, minWidth: 120, marginBottom: 8 }}>
                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300 }}>Flete</Text>
                                <View style={[inputWrap, { marginTop: 6 }]}>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={flete}
                                        onChangeText={setFlete}
                                        placeholder="0"
                                        placeholderTextColor={colors.gris400}
                                        style={{ fontFamily: fonts.Inter.Regular, fontSize: 15, color: colors.Griss50, paddingVertical: 10 }}
                                    />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                let locallyTotal = totalRx
                                if (flete && flete !== '0') {
                                    locallyTotal += parseInt(flete, 10)
                                }
                                if (persentage && persentage !== '0') {
                                    locallyTotal -= locallyTotal * (parseInt(persentage, 10) / 100)
                                }
                                if (iva) {
                                    locallyTotal += locallyTotal * 0.16
                                }
                                setTotal(locallyTotal)
                            }}
                            activeOpacity={0.88}
                            style={{
                                marginTop: 14,
                                backgroundColor: colors.Morado600,
                                borderRadius: 12,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 14, color: LABEL_ON_SOLID }}>
                                Aplicar descuento, flete e IVA al total
                            </Text>
                        </TouchableOpacity>

                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>Anticipo</Text>
                        <View style={[inputWrap, { backgroundColor: `${colors.Griss50}10` }]}>
                            <TextInput
                                keyboardType="numeric"
                                onChangeText={SetAnticipo}
                                placeholder="0.00"
                                placeholderTextColor={colors.gris400}
                                style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, paddingVertical: 10 }}
                            />
                        </View>
                            </View>
                        ) : null}
                    </AppCard>

                    {(inventaryRx.length > 0 || packagesRx.length > 0) && (
                        <AppCard style={{ marginTop: 12, padding: 0 }}>
                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={() => toggleAccordion('material')}
                                style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
                            >
                                <MaterialCommunityIcons
                                    name={accordion.material ? 'chevron-up' : 'chevron-down'}
                                    size={22}
                                    color={colors.Morado100}
                                    style={{ marginRight: 8 }}
                                />
                                <MaterialCommunityIcons name="package-variant-closed" size={24} color={colors.Morado100} style={{ marginRight: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 17, color: colors.Griss50 }}>Resumen de material</Text>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                                        {inventaryRx.length} producto{inventaryRx.length !== 1 ? 's' : ''} · {packagesRx.length} paquete
                                        {packagesRx.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {accordion.material ? (
                                <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>

                            {inventaryRx.map((item, index) => (
                                <AppCard key={`inv-${item.id_mob}-${index}`} style={{ marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Griss50 }}>{item.nombre_mob}</Text>
                                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                                                {item.cantidad} rentado{item.cantidad !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Morado100 }}>${item.costo_mob}</Text>
                                    </View>
                                </AppCard>
                            ))}

                            {packagesRx.map((item, index) => (
                                <AppCard key={`pkt-${item.id}-${index}`} style={{ marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Griss50 }}>
                                                {item.nombre}
                                                <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris400 }}> · paquete</Text>
                                            </Text>
                                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, marginTop: 4 }}>
                                                {item.cantidad} rentado{item.cantidad !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Morado100 }}>${item.precio}</Text>
                                    </View>
                                </AppCard>
                            ))}

                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 14,
                                    marginTop: 4,
                                }}
                            >
                                <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.primario300} />
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.primario300, marginLeft: 8 }}>
                                    Agregar o quitar material
                                </Text>
                            </TouchableOpacity>
                                </View>
                            ) : null}
                        </AppCard>
                    )}
                </View>
            </ScrollView>

            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: colors.DarkViolet300,
                    borderTopWidth: 1,
                    borderTopColor: `${colors.Griss50}22`,
                }}
            >
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <AppCard style={{ flex: 1, marginRight: 8, paddingVertical: 10, marginBottom: 0 }}>
                        <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300 }}>Total estimado</Text>
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 18, color: colors.Morado100, marginTop: 4 }}>${total.toFixed(2)}</Text>
                    </AppCard>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                    <TouchableOpacity
                        disabled={loading}
                        onPress={submit}
                        activeOpacity={0.9}
                        style={{
                            flex: 1,
                            backgroundColor: colors.Morado600,
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: LABEL_ON_SOLID }}>Crear evento</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setOpenAlert(true)}
                        activeOpacity={0.88}
                        style={{
                            width: 52,
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
            <DatePickerComponent
                date={new Date(formatDate)}
                mode={typePicker.mode}
                open={openModalPicker}
                onChangePicker={(d) => {
                    setOpenModalPicker(false)
                    if (!d) return
                    switch (typePicker.type) {
                        case ETypesPicker.Recolection:
                            setRecolectedDay({ date: d?.toISOString().split('T')[0], hour: '' })
                            break
                        case ETypesPicker.HourRecolection:
                            setRecolectedDay({ ...recolectedDay, hour: d?.toISOString().split('T')[1].split('.')[0] })
                            break
                        case ETypesPicker.Delivery:
                            setDeliveredDay({ date: d?.toISOString().split('T')[0], hour: '' })
                            break
                        case ETypesPicker.HourDelivery:
                            setDeliveredDay({ ...deliveredDay, hour: d?.toISOString().split('T')[1].split('.')[0] })
                            break
                        default:
                            break
                    }
                }}
            />

            <SelectStreetMap
                open={openAddress}
                props={(p: any) => {
                    if (!p) return setOpenAddress(false)
                    setLatLon(p)
                    setOpenAddress(false)
                }}
            />

            <ConfirmDialog
                open={openAlert}
                headline="Salir sin guardar"
                title="Se descartará la información de este evento y volverás al inicio."
                confirmLabel="Salir"
                tone="danger"
                sure={() => {
                    setOpenAlert(false)
                    navigation.navigate('Home', { refresh: false })
                }}
                notsure={() => setOpenAlert(false)}
            />
            <Toast />
        </View>
    )
}

export default AddEvent
