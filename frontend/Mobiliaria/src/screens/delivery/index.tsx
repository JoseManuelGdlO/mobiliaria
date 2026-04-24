import { useTheme } from "@hooks/useTheme"
import { convertirEspLetra, mesEspanol } from "@utils/dateFormat"
import React, { useEffect } from "react"
import { FlatList, Platform, Text, TextInput, TouchableOpacity, View, PermissionsAndroid } from 'react-native'
import * as workersService from '@services/workers'
import Loading from "@components/loading"
import { IEventDelivery, IInvDelivery } from "@interfaces/event-delivery"
import PrimaryButton from "@components/PrimaryButton"
import AppCard from "@components/AppCard"
import messaging from '@react-native-firebase/messaging';
import useReduxUser from "@hooks/useReduxUser";
import Toast from "react-native-toast-message";
import * as authService from '../../services/auth';
import { Linking } from "react-native";
import { sendLocationWS } from "@utils/locationForegraund"


export interface IDays {
    date: string
    letter: string
    dayNumber: string
    month: string
    year: string
    requestdate: string
    selected: boolean
}

const Delivery = (): JSX.Element => {
    const [days, setDays] = React.useState<IDays[]>([])
    const [events, setEvents] = React.useState<IEventDelivery[]>([])
    const [loading, setLoading] = React.useState<boolean>(true)

    const { fonts, colors, layout } = useTheme()
    const dayCardWidth = layout.isTablet ? 118 : (layout.width - 28) / 5
    const { user, token } = useReduxUser()

    const requestUserPermissions = async () => {

        try {
            if(Platform.OS === 'android') {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            }
            const authStatus = await messaging().requestPermission();
            const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
            if (enabled) {
                console.log('Authorization status:', authStatus);
                getToken();
            }
        } catch (error) {
            console.log(error);
        }

    }

    const getToken = async () => {
        try {
            const token = await messaging().getToken();
            
            await messaging().subscribeToTopic(`company${user.id_empresa}`)
            const response = await authService.tokenUser(user.id_usuario, token)
            
        } catch (error) {
            console.log(error);
        }
    }

    const subscribeNotifications = async () => {
        messaging().onMessage(async remoteMessage => {
            const not = remoteMessage
            const title = `${not?.data?.nombre} agregó un nuevo evento`
            Toast.show({
                type: 'success',
                text1: title,
                text2: not.notification?.body,
                visibilityTime: 3000,
                autoHide: true
            })
        });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });
    }   

    const getDates = () => {
        const days: IDays[] = []
        const date = new Date()
        let today = date.toString()
        let day1: IDays = { selected: false, date: '', letter: '', dayNumber: '', month: '', year: '', requestdate: '' }

        day1.date = today
        day1.letter = today.substr(0, 3)
        day1.letter = convertirEspLetra(day1.letter)
        day1.dayNumber = today.substr(8, 2)
        day1.month = today.substr(4, 3);
        day1.month = mesEspanol(day1.month)
        day1.year = today.substr(11, 4)
        day1.selected = true

        day1.requestdate = `${day1.year}-${day1.month}-${day1.dayNumber}`
        days.push(day1)
        getRequestDay(day1.requestdate)



        let day2: IDays = { selected: false, date: '', letter: '', dayNumber: '', month: '', year: '', requestdate: '' }

        today = new Date(date.setDate(date.getDate() + 1)).toString();


        day2.date = today
        day2.letter = today.substr(0, 3)
        day2.letter = convertirEspLetra(day2.letter)
        day2.dayNumber = today.substr(8, 2)
        day2.month = today.substr(4, 3);
        day2.month = mesEspanol(day2.month)
        day2.year = today.substr(11, 4)
        day2.selected = false

        day2.requestdate = `${day2.year}-${day2.month}-${day2.dayNumber}`

        days.push(day2)


        let day3: IDays = { selected: false, date: '', letter: '', dayNumber: '', month: '', year: '', requestdate: '' }
        today = new Date(date.setDate(date.getDate() + 1)).toString();

        day3.date = today
        day3.letter = today.substr(0, 3)
        day3.letter = convertirEspLetra(day3.letter)
        day3.dayNumber = today.substr(8, 2)
        day3.month = today.substr(4, 3);
        day3.month = mesEspanol(day3.month)
        day3.year = today.substr(11, 4)
        day3.selected = false

        day3.requestdate = `${day3.year}-${day3.month}-${day3.dayNumber}`

        days.push(day3)


        let day4: IDays = { selected: false, date: '', letter: '', dayNumber: '', month: '', year: '', requestdate: '' }
        today = new Date(date.setDate(date.getDate() + 1)).toString();

        day4.date = today
        day4.letter = today.substr(0, 3)
        day4.letter = convertirEspLetra(day4.letter)
        day4.dayNumber = today.substr(8, 2)
        day4.month = today.substr(4, 3);
        day4.month = mesEspanol(day4.month)
        day4.year = today.substr(11, 4)
        day4.selected = false

        day4.requestdate = `${day4.year}-${day4.month}-${day4.dayNumber}`

        days.push(day4)

        let day5: IDays = { selected: false, date: '', letter: '', dayNumber: '', month: '', year: '', requestdate: '' }
        today = new Date(date.setDate(date.getDate() + 1)).toString();

        day5.date = today
        day5.letter = today.substr(0, 3)
        day5.letter = convertirEspLetra(day5.letter)
        day5.dayNumber = today.substr(8, 2)
        day5.month = today.substr(4, 3);
        day5.month = mesEspanol(day5.month)
        day5.year = today.substr(11, 4)
        day5.selected = false

        day5.requestdate = `${day5.year}-${day5.month}-${day5.dayNumber}`

        days.push(day5)
        setDays(days)


    }

    const getRequestDay = async (requestdate: string) => {
        try {
            const response = await workersService.getEventsDelivery(requestdate)
            setEvents(response)

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false)
        }
    }

    const clickButtons = (day: IDays) => {
        const daysLocal: IDays[] = days
        for (const dayLocal of daysLocal) {
            if (day.dayNumber === dayLocal.dayNumber) {
                dayLocal.selected = true
            } else {
                dayLocal.selected = false
            }
        }

        setDays([...daysLocal])
        setLoading(true)
        getRequestDay(day.requestdate)
    }

    const keyExtractor = (item: IDays, index: number): string => item.dayNumber.toString() + index.toString()
    const keyEventExtractor = (item: any, index: number): string => item.id_evento.toString() + index.toString()

    const renderItem = ({
        item,
        index
    }: {
        item: IDays
        index: number
    }): JSX.Element => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => clickButtons(item)}
                    style={{
                        width: dayCardWidth,
                        marginHorizontal: 2,
                        backgroundColor: item.selected ? colors.Morado600 : `${colors.white}0B`,
                        borderRadius: 14,
                        height: 94,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: item.selected ? `${colors.Morado100}AA` : `${colors.white}1F`
                    }}>
                    <View
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: 99,
                            marginBottom: 8,
                            backgroundColor: item.selected ? colors.white : `${colors.white}22`,
                        }}
                    />
                    <Text style={{ fontFamily: fonts.Inter.SemiBold, color: item.selected ? colors.white : colors.gris300, fontSize: 21 }}>{item.letter}</Text>
                    <Text style={{ fontFamily: fonts.Inter.Medium, paddingTop: 4, color: item.selected ? colors.white : colors.gris300, fontSize: 15 }}>{item.dayNumber}</Text>
                </TouchableOpacity>
            </>
        )
    }

    const renderEventsItem = ({
        item,
        index
    }: {
        item: IEventDelivery
        index: number
    }): JSX.Element => {
        return (
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                <AppCard padding={16}>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text numberOfLines={2} style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold, fontSize: 16, textAlign: 'center' }}>{item.nombre_evento}</Text>
                        <Text numberOfLines={2} style={{ paddingTop: 5, color: colors.gris300, fontFamily: fonts.Inter.Regular, fontSize: 13, textAlign: 'center' }}>{item.nombre_titular_evento}</Text>
                        <Text style={{ paddingTop: 10, fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.Griss100 }}>{item.telefono_titular_evento}</Text>
                    </View>
                    <View>
                        <Text style={{ color: colors.primario300, paddingTop: 12, fontFamily: fonts.Inter.SemiBold, fontSize: 15 }}>Envío</Text>
                        <Text numberOfLines={3} style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.Griss50, marginTop: 4 }}>Dirección: {item.direccion_evento}</Text>
                        <TouchableOpacity onPress={() => {
                            Linking.openURL(item?.url)
                        }}>
                            <Text numberOfLines={1} style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.Morado100, marginTop: 4 }}>URL: {item.url}</Text>
                        </TouchableOpacity>
                        <Text numberOfLines={1} style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.gris300, marginTop: 4 }}>Hora de {item.tipo_evento === 'recoleccion' ? 'recolección: ' + item.hora_recoleccion_evento : 'envío: ' + item.hora_envio_evento}</Text>
                    </View>
                    <View>
                        <FlatList
                            data={item.inventario}
                            style={{ flexGrow: 0, width: '100%', paddingTop: 10 }}
                            renderItem={({
                                item,
                                index
                            }: {
                                item: IInvDelivery
                                index: number
                            }) => {
                                return (
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', backgroundColor: String(index / 2).includes('.') ? `${colors.white}08` : `${colors.white}15`, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, marginBottom: 4 }}>
                                        <Text numberOfLines={1} style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, flex: 1, color: colors.Griss50 }}>{item.nombre_mob}</Text>
                                        <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.Griss50 }}>{item.ocupados}</Text>
                                    </View>
                                )

                            }}
                            keyExtractor={(item, index) => index.toString() + item.id_mob.toString()}
                        />
                    </View>
                    <View>
                        <Text style={{ color: colors.primario300, paddingTop: 10, fontFamily: fonts.Inter.Medium, fontSize: 14 }}>Tus observaciones</Text>
                        <View style={{ backgroundColor: `${colors.white}10`, borderWidth: 1, borderColor: `${colors.white}16`, width: '100%', minHeight: 30, borderRadius: 10, marginTop: 5, paddingHorizontal: 10, paddingBottom: 8 }}>
                            <TextInput
                                placeholder="Escribe una observación"
                                placeholderTextColor={colors.gris300}
                                style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, width: '100%', minHeight: 30, color: colors.Griss100 }}
                            />
                        </View>
                        <PrimaryButton
                            containerStyle={{ width: '100%', paddingVertical: 8, marginTop: 10 }}
                            backgroundButton={item.tipo_evento === 'recoleccion' ? colors.red : colors.Morado600}
                            textStyle={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.white }}
                            onPress={() => console.log('hola')}
                            title={item.tipo_evento === 'recoleccion' ? 'INVENTARIO RECOGIDO' : 'INVENTARIO ENTREGADO'}
                        />

                    </View>
                </AppCard>
            </View>
        )
    }

    useEffect(() => {
        requestUserPermissions()
        subscribeNotifications()
       
        getDates()
        let cleanup: undefined | (() => Promise<void>)
        sendLocationWS(user, { token }).then((stopFn) => {
            cleanup = stopFn
        })

        return () => {
            if (cleanup) {
                cleanup()
            }
        }

    }, [])

    return (
        <View style={{ backgroundColor: colors.DarkViolet300, flex: 1 }}>
            <View style={{ width: '100%', alignContent: 'center', justifyContent: 'center' }}>
                <FlatList
                    ListHeaderComponent={() => {
                        return (
                            <View style={{ backgroundColor: colors.DarkViolet300 }} key={0}>
                                <FlatList
                                    data={days}
                                    horizontal
                                    style={{ flexGrow: 0, width: '100%' }}
                                    contentContainerStyle={{ paddingHorizontal: layout.contentHorizontalPadding - 10, paddingBottom: 10, flexGrow: 0 }}
                                    renderItem={renderItem}
                                    keyExtractor={keyExtractor}
                                    showsHorizontalScrollIndicator={false}
                                />
                                <View key={2}>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, paddingHorizontal: 18, color: colors.white, paddingBottom: 8 }}>Eventiva Delivery</Text>
                                </View>
                            </View>
                        )
                    }
                    }
                    stickyHeaderIndices={[0]}
                    data={events}
                    style={{ flexGrow: 0, width: '100%' }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={renderEventsItem}
                    scrollEnabled
                    keyExtractor={keyEventExtractor}
                />
            </View>
            <Loading loading={loading}></Loading>
        </View>
    )
}
export default Delivery