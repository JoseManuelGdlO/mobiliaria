import { NavigationScreens } from "@interfaces/navigation";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import CheckBox from '@react-native-community/checkbox';
import Loading from "@components/loading";
import LottieView from "lottie-react-native";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import { IEventDetail, IInventaryRent } from "@interfaces/event-details";
import { useNavigation } from "@react-navigation/native";
import useReduxEvent from "@hooks/useEvent";
import { IAvailability } from "@interfaces/availability";
import DatePickerComponent from "@components/datepicker";
import Toast from "react-native-toast-message";
import * as eventService from '@services/events'
import AreYouSure from "@components/are-you-suere-modal";
import { IPackage } from "@interfaces/packages";
import RNPickerSelect from 'react-native-picker-select';
import SelectStreetMap from "@components/select-street-map";
import { Linking } from "react-native";
import MultiSelect from "react-native-multiple-select";

export enum ETypesPicker {
    Recolection = 1,
    HourRecolection = 2,
    Delivery = 3,
    HourDelivery = 4
}

const AddEvent = ({
    route
}: StackScreenProps<NavigationScreens, 'AddEvent'>): JSX.Element => {
    const date = route.params.date
    const arrDate = date.split('-')
    const formatDate = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`


    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const [event, setEvent] = useState<IEventDetail>({} as IEventDetail)
    const [openAddress, setOpenAddress] = useState<boolean>(false)
    const [latlon, setLatLon] = useState<any>({ url: '', lat: 'none', lng: 'none' })
    const [loading, setLoading] = useState<boolean>(false)
    const { inventaryRx, totalRx, eventRx, packagesRx } = useReduxEvent()
    const [total, setTotal] = useState<number>(totalRx)
    const [persentage, setPersentage] = useState<string>('0')
    const [flete, setFlete] = useState<string>('0')
    const [iva, setIva] = useState<boolean>(false)
    const [openModalPicker, setOpenModalPicker] = useState<boolean>(false)
    const [toggleSwitch, setToggleSwitch] = useState<boolean>(false)
    const [togglePaymenthSwitch, setTogglePaymenthSwitch] = useState<boolean>(false)

    const [typePicker, setTypePicker] = useState<{ type: number, mode: "date" | "time" | "datetime" }>({ type: ETypesPicker.Recolection, mode: 'date' })
    const [recolectedDay, setRecolectedDay] = useState<{ date: string, hour: string }>({ date: date, hour: '9:00' })
    const [deliveredDay, setDeliveredDay] = useState<{ date: string, hour: string }>({ date: date, hour: '9:00' })
    const [notificationRecolection, setNotificationRecolection] = useState<string>('0')
    const [notificationSend, setNotificationSend] = useState<string>('0')
    const [anticipo, SetAnticipo] = useState<string>('')
    const [detailsEvent, setDetailsEvent] = useState<{ titular: string, tipo: string, telefono: string, direccion: string, nombreEvento: string }>({ nombreEvento: 'otro', titular: '', tipo: '', telefono: '', direccion: '' })
    const [openAlert, setOpenAlert] = useState<boolean>(false)
    const [selectedItems, setSelectedItems] = useState([])
    const [recTime, setRecTime] = useState<number>(0)

    const animation = React.useRef(null);


    const { fonts, colors } = useTheme()

    const submit = async () => {

        if (toggleSwitch && recTime === 0 || toggleSwitch && selectedItems.length === 0) {

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Faltan datos para el evento recurrente',
                visibilityTime: 1000,
                autoHide: true,
                onHide: () => {
                }
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
                onHide: () => {
                }
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
                onHide: () => {
                }
            })
            return
        }
        setLoading(true)

        let recDateArr = recolectedDay.date.split('-')
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
            descuento: persentage ? parseInt(persentage) : 0,
            ivavalor: iva ? 1 : 0,
            fletevalor: flete ? Number(flete) : 0,
            maps: latlon
        }

        event.pagado_evento = Number(anticipo) === total ? 1 : 0

        const mobiliario: any = []

        inventaryRx.forEach((item: IAvailability) => {

            mobiliario.push({
                fecha_evento: date,
                hora_evento: deliveredDay.hour,
                id_mob: item.id_mob,
                ocupados: item.cantidad,
                hora_recoleccion: recolectedDay.hour,
                costo: item.costo_mob
            })
        })

        const localAnticipo = anticipo ? Number(anticipo) : 0
        const costo = {
            costo_total: total,
            anticipo: localAnticipo,
            saldo: total - localAnticipo
        }

        const body = {
            evento: event,
            mobiliario: mobiliario,
            paquetes: packagesRx,
            costo,
            rec: false,
            notifications: {
                send: notificationSend,
                recolected: notificationRecolection
            }
        }

        try {

            await eventService.addEvent(body)
            if (toggleSwitch) {
                Toast.show({
                    type: 'info',
                    text1: 'Estamos preparando tus eventos recurrentes',
                    text2: 'ten paciencia, esto nos puede tomar mas tiempo',
                    visibilityTime: 15000,
                    autoHide: true
                })
                await eventService.addRecurrentEvent(body, recTime, selectedItems, parseDateString(date), togglePaymenthSwitch)
            }

            navigation.navigate('Home', { refresh: true })

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const parseDateString = (dateString: string) => {
        let day, month, year;
        let dateArr = dateString.split('-');
        if (dateArr[0].length === 2) {
            day = Number(dateArr[0]);
            month = Number(dateArr[1]);
            year = Number(dateArr[2]);
        } else {
            day = Number(dateArr[2]);
            month = Number(dateArr[1]);
            year = Number(dateArr[0]);
        }

        return new Date(year, month - 1, day); // El mes se resta por 1 porque los meses en Date van de 0 a 11
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
        const arrDate = arr.split('-')
        return `${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`

    }

    const onSelectedItemsChange = (selectedItems: any) => {

        setSelectedItems(selectedItems);
    };



    const keyExtractor = (item: IAvailability, index: number): string => index.toString()

    const renderItem = ({
        item,
        index
    }: {
        item: IAvailability
        index: number
    }): JSX.Element => {

        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                paddingHorizontal: 15,
                paddingVertical: 5
            }}>
                <View>
                    <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Regular, fontSize: 15 }}>{item.nombre_mob}</Text>
                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{item.cantidad} Rentado{item.cantidad !== 1 && 's'}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'blue', paddingTop: 10 }}>${item.costo_mob}</Text>
                </TouchableOpacity>
            </View>
        )
    }


    const keyExtractorPkt = (item: IPackage, index: number): string => item.id.toString() + index

    const renderItemPkt = ({
        item,
        index
    }: {
        item: IPackage
        index: number
    }): JSX.Element => {

        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                paddingHorizontal: 15,
                paddingVertical: 5
            }}>
                <View>
                    <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Regular, fontSize: 15 }}>{item.nombre}</Text>
                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{item.cantidad} Rentado{item.cantidad !== 1 && 's'}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'blue', paddingTop: 10 }}>${item.precio}</Text>
                </TouchableOpacity>
            </View>
        )
    }


    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ padding: 10, height: '35%' }}>
                <View style={{
                    padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1
                }}>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <LottieView
                            ref={animation}
                            autoPlay
                            loop={true}
                            style={{
                                width: 100,
                                height: 100,
                                backgroundColor: 'transparent',
                            }}
                            // Find more Lottie files at https://lottiefiles.com/featured
                            source={require('../../assets/images/lottie/event.json')}
                        />
                        <View style={{ paddingTop: 20, width: '100%' }}>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <View style={{ width: '20%' }}>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 10, paddingTop: 15 }}>Titular.- </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 10, paddingTop: 15 }}>Tipo evento.- </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 10, paddingTop: 15 }}>Telefono.- </Text>
                                </View>
                                <View style={{ width: '80%', paddingEnd: 15 }}>
                                    <TextInput onChangeText={(value: string) => {
                                        setDetailsEvent({ ...detailsEvent, titular: value })
                                    }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 5, fontFamily: fonts.Roboto.Regular, fontSize: 15 }}></TextInput>
                                    <TextInput
                                        onChangeText={(value: string) => {
                                            setDetailsEvent({ ...detailsEvent, tipo: value })
                                        }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 5, fontFamily: fonts.Roboto.Regular, fontSize: 15 }}></TextInput>
                                    <TextInput keyboardType="number-pad"
                                        onChangeText={(value: string) => {
                                            setDetailsEvent({ ...detailsEvent, telefono: value })
                                        }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 5, fontFamily: fonts.Roboto.Regular, fontSize: 15 }}></TextInput>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingTop: 15 }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Direccion:</Text>
                        <TextInput placeholder=""
                            onChangeText={(value: string) => {
                                setDetailsEvent({ ...detailsEvent, direccion: value })
                            }}
                            style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                        <TouchableOpacity onPress={() => {
                            setOpenAddress(true)

                        }}
                            style={{ height: 30, width: '100%', backgroundColor: '#488aff', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 5 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 12 }}>Agregar en el mapa</Text>
                        </TouchableOpacity>
                        {latlon.url.lenght !== 0 && <TouchableOpacity onPress={() => {
                            Linking.openURL(latlon.url);
                        }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'blue', fontSize: 8, fontStyle: "italic" }}>{latlon.url}</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity style={{ display: "flex", flexDirection: "row", width: '100%' }}>
                            <Switch
                                style={{ paddingTop: 7 }}
                                trackColor={{ false: "#767577", true: "#00bcbb" }}
                                thumbColor={toggleSwitch ? "#488aff" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={setToggleSwitch}
                                value={toggleSwitch}
                            />
                            <Text
                                style={{
                                    paddingTop: 5,
                                    paddingLeft: 5,
                                    fontFamily: fonts.Roboto.Regular,
                                    color: toggleSwitch ? "#00bcbb" : "#767577",
                                    fontSize: 18,
                                    textAlign: "center",
                                }}
                            >
                                Evento Recurrente
                            </Text>
                        </TouchableOpacity>
                        {toggleSwitch &&
                            <View>
                                <ScrollView>
                                    <MultiSelect
                                        items={[
                                            {
                                                id: 1,
                                                name: 'Lunes'
                                            }, {
                                                id: 2,
                                                name: 'Martes'
                                            }, {
                                                id: 3,
                                                name: 'Miercoles'
                                            }, {
                                                id: 4,
                                                name: 'Jueves'
                                            }, {
                                                id: 5,
                                                name: 'Viernes'
                                            }, {
                                                id: 6,
                                                name: 'Sabado'
                                            }, {
                                                id: 0,
                                                name: 'Domingo'
                                            },
                                        ]}
                                        uniqueKey="id"
                                        onSelectedItemsChange={onSelectedItemsChange}
                                        selectedItems={selectedItems}
                                        selectText="Dias que se repite"
                                        searchInputPlaceholderText="dias"
                                        submitButtonText="Aceptar"
                                        submitButtonColor="#488aff"
                                    />

                                    <Text style={{ width: '100%' }}>Tiempo de recurrencia</Text>
                                    <RNPickerSelect
                                        key={5}
                                        placeholder="Selecciona el tiempo de recurrencia"
                                        value={recTime}
                                        onValueChange={(value) => setRecTime(value)}
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
                                    <TouchableOpacity style={{ display: "flex", flexDirection: "row", width: '100%' }}>
                                        <Switch
                                            style={{ paddingTop: 7 }}
                                            trackColor={{ false: "#767577", true: "#00bcbb" }}
                                            thumbColor={togglePaymenthSwitch ? "#488aff" : "#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={setTogglePaymenthSwitch}
                                            value={togglePaymenthSwitch}
                                        />
                                        <Text
                                            style={{
                                                paddingTop: 5,
                                                paddingLeft: 5,
                                                fontFamily: fonts.Roboto.Regular,
                                                color: togglePaymenthSwitch ? "#00bcbb" : "#767577",
                                                fontSize: 12,
                                                textAlign: "center",
                                            }}
                                        >
                                            Evento pagado
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>}
                        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 10 }}>Fecha: </Text>
                            <TextInput editable={false} value={date} style={{ width: '90%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} ></TextInput>

                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 20 }}>Hora de entrega: </Text>
                            <View style={{ width: '70%', paddingTop: 0, borderBottomColor: '#000', borderBottomWidth: 1 }}>

                                <RNPickerSelect
                                    style={{ inputIOS: { height: 35, paddingTop: 10, paddingLeft: 5 } }}
                                    key={1}
                                    placeholder="Seleciona la hora"
                                    onValueChange={(value) => setDeliveredDay({ ...deliveredDay, hour: value })}
                                    items={[
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
                                    ]}
                                />
                            </View>

                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 20 }}>Que me avise: </Text>
                            <View style={{ width: '70%', paddingTop: 0, borderBottomColor: '#000', borderBottomWidth: 1 }}>

                                <RNPickerSelect
                                    style={{ inputIOS: { height: 35, paddingTop: 10, paddingLeft: 5 } }}
                                    key={4}
                                    placeholder="Seleciona la hora"
                                    onValueChange={(value) => setNotificationSend(value)}
                                    items={[
                                        { label: 'nunca', value: '0' },
                                        { label: '1 hora antes', value: '1h' },
                                        { label: '5 horas antes', value: '5h' },
                                        { label: '1 dia antes', value: '1d' },
                                        { label: '1 semana antes', value: '1s' },
                                        { label: '1 mes antes', value: '1m' }
                                    ]}
                                />
                            </View>

                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 20 }}>Fecha de recoleccion: </Text>

                            <View style={{ width: '100%', paddingTop: 0, borderBottomColor: '#000', borderBottomWidth: 1 }}>
                                <RNPickerSelect
                                    key={2}
                                    placeholder="Seleciona la hora"
                                    style={{ inputIOS: { height: 35, paddingTop: 10, paddingLeft: 5 } }}
                                    onValueChange={(value) => {
                                        setRecolectedDay({ ...recolectedDay, date: value })
                                    }
                                    }
                                    items={[
                                        { label: changeDate(0), value: changeDate(0) },
                                        { label: changeDate(1), value: changeDate(1) },
                                        { label: changeDate(2), value: changeDate(2) },
                                        { label: changeDate(3), value: changeDate(3) },
                                    ]}
                                />

                            </View>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, marginLeft: 5, fontSize: 12, paddingTop: 20 }}>Hora de recoleccion: </Text>
                            <View style={{ width: '70%', paddingTop: 0, borderBottomColor: '#000', borderBottomWidth: 1 }}>
                                <RNPickerSelect
                                    key={3}
                                    placeholder="Seleciona la hora"
                                    style={{ inputIOS: { height: 35, paddingTop: 10, paddingLeft: 5 } }}
                                    onValueChange={(value) => setRecolectedDay({ ...recolectedDay, hour: value })}
                                    items={[
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
                                    ]}
                                />

                            </View>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 20 }}>Que me avise: </Text>
                            <View style={{ width: '70%', paddingTop: 0, borderBottomColor: '#000', borderBottomWidth: 1 }}>

                                <RNPickerSelect
                                    style={{ inputIOS: { height: 35, paddingTop: 10, paddingLeft: 5 } }}
                                    key={4}
                                    placeholder="Seleciona la hora"
                                    onValueChange={(value) => setNotificationRecolection(value)}
                                    items={[
                                        { label: 'nunca', value: '0' },
                                        { label: '1 hora antes', value: '1h' },
                                        { label: '5 horas antes', value: '5h' },
                                        { label: '1 dia antes', value: '1d' },
                                        { label: '1 semana antes', value: '1s' },
                                        { label: '1 mes antes', value: '1m' }
                                    ]}
                                />
                            </View>

                        </View>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', width: 80 }}>
                            <CheckBox value={iva} onValueChange={setIva}></CheckBox>
                            <Text style={{
                                fontFamily: fonts.Roboto.Bold,
                                fontSize: 12,
                                paddingTop: 5,
                                paddingHorizontal: 15,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                IVA</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{
                                fontFamily: fonts.Roboto.Bold,
                                fontSize: 12,
                                paddingTop: 5,
                                paddingHorizontal: 15,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                % Descuento.-</Text>
                            <TextInput
                                onChangeText={setPersentage}
                                value={persentage}
                                keyboardType="numeric"
                                style={{ width: 50, backgroundColor: colors.gray400, height: 25, borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} ></TextInput>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{
                                fontFamily: fonts.Roboto.Bold,
                                fontSize: 12,
                                paddingTop: 5,
                                paddingHorizontal: 15,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                Flete.-</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={flete}
                                onChangeText={setFlete}
                                style={{ width: 50, backgroundColor: colors.gray400, height: 25, borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} ></TextInput>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => {

                        let locallyTotal = totalRx
                        if (flete && flete !== '0') {
                            locallyTotal = locallyTotal + parseInt(flete)
                        }

                        if (persentage && persentage !== '0') {
                            locallyTotal = locallyTotal - (locallyTotal * (parseInt(persentage) / 100))
                        }

                        if (iva) {
                            locallyTotal = locallyTotal + (locallyTotal * .16)
                        }
                        setTotal(locallyTotal)
                    }}
                        style={{ height: 30, width: '100%', backgroundColor: '#488aff', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 5 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 12 }}>Confirmar Descuento, flete e IVA</Text>
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginTop: 10
                    }}>
                        <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 15, paddingTop: 5, color: '#9E2EBE' }}>Anticipo </Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', width: '100%', minHeight: 30, borderRadius: 8, marginTop: 5, paddingHorizontal: 10, paddingBottom: 8 }}>
                        <TextInput keyboardType="numeric"
                            onChangeText={SetAnticipo}
                            style={{ fontFamily: fonts.Roboto.Regular, fontSize: 25, paddingTop: 5 }}></TextInput>
                    </View>
                </View>
            </ScrollView>
            {event && event.payments &&
                <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                    <View style={{
                        padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, overflow: 'hidden'
                    }}>
                        <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>Seguimiento al pago del evento</Text>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                            <View style={{ paddingTop: 10 }}>
                                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Costo del evento.- {event?.payments[0]?.costo_total} </Text>
                                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Anticipo.- {event?.payments[0]?.anticipo} </Text>
                                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Saldo al corte.- {event?.payments[0]?.saldo} </Text>
                                <Text style={{ fontFamily: fonts.Roboto.MediumItalic, marginTop: 5, fontSize: 12 }}>Abonos </Text>
                                <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{event?.payments.map(item => item.abono)} </Text>

                                <TouchableOpacity style={{ backgroundColor: '#488aff', alignItems: 'center', marginTop: 10, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
                                    <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, color: '#FFF' }}>Agregar abono</Text>
                                </TouchableOpacity>

                            </View>
                            <LottieView
                                ref={animation}
                                autoPlay
                                loop={true}
                                style={{
                                    width: 150,
                                    height: 150,
                                    backgroundColor: 'transparent',
                                }}
                                // Find more Lottie files at https://lottiefiles.com/featured
                                source={require('../../assets/images/lottie/followpayment.json')}
                            />
                        </View>
                    </View>
                </View>
            }
            {inventaryRx.length !== 0 &&
                <FlatList
                    style={{ paddingTop: 10 }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                    data={inventaryRx}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListFooterComponent={() => {
                        return (
                            <View>
                                {packagesRx.length !== 0 ? <View /> :
                                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 16 }}>Agregar material</Text>
                                    </TouchableOpacity>
                                }</View>
                        )
                    }}
                />
            }
            {packagesRx.length !== 0 &&
                <FlatList
                    style={{ paddingTop: 10 }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                    data={packagesRx}
                    renderItem={renderItemPkt}
                    keyExtractor={keyExtractorPkt}
                    ListFooterComponent={() => {
                        return (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 16 }}>Agregar material</Text>
                            </TouchableOpacity>
                        )
                    }}
                />}
            {/* <View style={{ height: 200 }} /> */}
            <View style={{ width: '100%', position: 'absolute', bottom: 0, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.gray400 }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: 5 }}>
                    <View style={{ height: 25, width: '30%', backgroundColor: '#FFF', marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Regular }}>Total
                        </Text>
                    </View>
                    <View style={{ height: 25, width: '30%', backgroundColor: '#FFF', marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>${total}</Text>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity disabled={loading} onPress={submit} style={{ height: 40, width: '80%', backgroundColor: '#488aff', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Continuar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setOpenAlert(true)
                    }}
                        style={{ height: 40, width: '20%', backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Cancelar</Text>
                    </TouchableOpacity>

                </View>
            </View>
            <Loading loading={loading}></Loading>
            <DatePickerComponent date={new Date(formatDate)} mode={typePicker.mode} open={openModalPicker} onChangePicker={(date) => {
                setOpenModalPicker(false)
                if (!date) return
                switch (typePicker.type) {
                    case ETypesPicker.Recolection:
                        setRecolectedDay({ date: date?.toISOString().split('T')[0], hour: '' })
                        break;
                    case ETypesPicker.HourRecolection:
                        setRecolectedDay({ ...recolectedDay, hour: date?.toISOString().split('T')[1].split('.')[0] })
                        break;
                    case ETypesPicker.Delivery:
                        setDeliveredDay({ date: date?.toISOString().split('T')[0], hour: '' })
                        break;
                    case ETypesPicker.HourDelivery:
                        setDeliveredDay({ ...deliveredDay, hour: date?.toISOString().split('T')[1].split('.')[0] })
                        break;
                    default:
                        break;

                }
            }
            }></DatePickerComponent>

            <SelectStreetMap open={openAddress} props={(p: any) => {
                console.log(p)
                if (!p) return setOpenAddress(false)
                setLatLon(p)
                setOpenAddress(false)
            }}></SelectStreetMap>
            <AreYouSure open={openAlert} sure={() => {
                setOpenAlert(false)
                navigation.navigate('Home', { refresh: false })
            }}
                notsure={() => {
                    setOpenAlert(false)
                }}
            ></AreYouSure>
            <Toast />
        </View>
    )
}

export default AddEvent
