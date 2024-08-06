import React, { useEffect } from "react"
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { CalendarList } from 'react-native-calendars'
import { LocaleConfig } from 'react-native-calendars';
import { Dimensions } from 'react-native';
import * as eventService from '../../services/events';
import * as authService from '../../services/auth';
import { MarkedDates } from "react-native-calendars/src/types";
import { useTheme } from "@hooks/useTheme";
import CardEvents from "@components/CardEvents";
import { monthToString } from "@utils/dateFormat";
import { Skeleton } from "@rneui/themed/dist/Skeleton";
import Loading from "@components/loading";
import PrimaryButton from "@components/PrimaryButton";
import { NavigationScreens } from "@interfaces/navigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import useReduxUser from "@hooks/useReduxUser";
import Toast from "react-native-toast-message";
import { sendLocationWS } from "@utils/locationForegraund";
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
    today: "Hoy es.-"
};
LocaleConfig.defaultLocale = 'es';


const Home = ({
    route
}: StackScreenProps<NavigationScreens, 'Home'>): JSX.Element => {
    const refresh = route.params?.refresh
    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const [dates, setDates] = React.useState<MarkedDates>({});
    const [eventsDay, setEventsDay] = React.useState<any>([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [dateEvent, setDateEvent] = React.useState('');
    const [total, setTotal] = React.useState('0');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [ requestDate, setRequestDate ] = React.useState<string>('');

    const { colors, fonts } = useTheme();

    const { user } = useReduxUser()

    const requestUserPermissions = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            getToken();
        }
    }

    const getToken = async () => {
        try {
            const token: any = await messaging().getAPNSToken;
            await messaging().subscribeToTopic(`company${user.id_empresa}`)
            const response = await authService.tokenUser(user.id_usuario, token)
            
        } catch (error) {
            console.log(error);
        }
    }

    const subscribeNotifications = async () => {
        messaging().onMessage(async remoteMessage => {
            const not = remoteMessage
            console.log('not', not);
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


    const addEvent = () => { 
        navigation.navigate('Available', { date: requestDate })
    }

    const getColorSpecific = (total: number): string => {

        if (total <= 2) {
            return '#9E2EBE'
        } else if (total <= 4) {
            return '#4E52D7'
        } else if (total <= 7) {
            return '#5533BF'
        }
        return '#331f73'
    }

    const getEvents = async () => {
        try {
            const response = await eventService.getEvents()
            
            const dates: MarkedDates = {}
            for (const date of response.data) {

                dates[date.fecha_envio_evento.split('T')[0]] = {
                    selected: true,
                    marked: false,
                    selectedColor: getColorSpecific(date.total),
                }
            }
            setDates(dates)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
            setLoading(false)
        }

    }

    const getEventsDay = async (date: string) => {
        try {
            setTotal('0')
            const response = await eventService.getEventsDay(date)
            if(response.data.length !== 0){
                setTotal(formatCurrency(response.total.toString()))
            }

            setEventsDay(response.data)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
        }

    }

    const formatCurrency = (value: any) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(value);
      };


    const keyExtractor = (item: (any), index: number): string => index.toString()

    const onRefresh = React.useCallback(() => {
        setLoading(true)
        setRefreshing(true);
        const date = new Date().toISOString().split('T')[0]
        getEventsDay(date)
        getEvents()
    }, []);

    useEffect(() => {   
        requestUserPermissions()
        subscribeNotifications()
       
  
        setLoading(true)
        getEvents()
        // sendLocationWS(user)
        const date = new Date().toISOString().split('T')[0]
        const arrDate = date.split('-') 
        
        if (refresh) {
            setLoading(true)
            getEvents()
        }
        
        setRequestDate(`${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`)
        setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)
        getEventsDay(date)
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true)
            getEvents();
        });
    
        return unsubscribe;
      }, [navigation]);

    const renderItem = ({
        item,
        index
    }: {
        item: []
        index: number
    }): JSX.Element => {
        return (
            <>
                <CardEvents data={item}></CardEvents>
            </>
        )
    }


    return (
        <View>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <CalendarList
                    key={1}
                    onDayPress={async (day: any) => {
                        const date = day.dateString
                        const arrDate = date.split('-')
                        setLoading(true)

                        setRequestDate(`${arrDate[0]}-${arrDate[1]}-${arrDate[2]}`)
                        setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)
                        await getEventsDay(date)
                        setLoading(false)
                    }}
                    // Enable horizontal scrolling, default = false
                    horizontal={true}
                    // Enable paging on horizontal, default = false
                    pagingEnabled={true}
                    // Set custom calendarWidth.
                    calendarWidth={Dimensions.get('window').width}
                    markedDates={dates}
                />
            </ScrollView>
            {loading
                ? <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', borderTopLeftRadius: 8, paddingHorizontal: 30, paddingVertical: 25, borderTopRightRadius: 8, marginTop: -15 }}>
                    <Skeleton animation="pulse" width={175} height={20} />
                    <Skeleton animation="pulse" style={{ borderRadius: 8, marginTop: 15 }} width={350} height={180} />
                    <Skeleton animation="pulse" style={{ borderRadius: 8, marginTop: 15 }} width={350} height={180} />
                </View>
                :
                <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginTop: -15, height: 500, paddingBottom: 50 }}>
                    <FlatList
                        ListHeaderComponent={() => {
                            return (
                                <View>
                                    <Text style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', color: '#000', fontSize: 15, fontWeight: '100', marginTop: 8, paddingHorizontal: 10, paddingVertical: 5, borderTopRightRadius:8, borderTopLeftRadius:8, fontFamily: fonts.Roboto.Regular }}>
                                        Eventos del dia <Text style={{ fontWeight: '500', color: '#153acb', fontFamily: fonts.Roboto.BlackItalic, fontStyle: 'italic' }}>{dateEvent}</Text>
                                    </Text>
                                    { total !== '0' && <Text style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', color: '#000', fontSize: 10, fontWeight: '100', marginBottom: 8, paddingHorizontal: 10, paddingBottom: 5, borderBottomLeftRadius:8, borderBottomRightRadius:8, fontFamily: fonts.Roboto.Regular }}>
                                        Corte diario <Text style={{ fontWeight: '500', color: '#153acb', fontFamily: fonts.Roboto.BlackItalic, fontStyle: 'italic' }}>{total}</Text>
                                    </Text>}
                                    <PrimaryButton
                                        containerStyle={{ width: '100%', paddingVertical: 5, marginBottom: 5 }}
                                        textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: '#FFF' }}
                                        backgroundButton="#9E2EBE"
                                        onPress={addEvent}
                                        title='Crear nuevo evento'
                                    />
                                </View>
                            )
                        }}
                        ListEmptyComponent={() => {
                            return (
                                <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', paddingVertical: 20, height: 150, alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 50 }}>
                                    <Text style={{ color: '#000', fontSize: 15, fontWeight: '100', marginVertical: 8, paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular }}>
                                        No hay eventos para este dia 😪
                                    </Text>
                                </View>
                            )
                        }}
                        ListFooterComponent={() => {
                            return (
                                <View style={{ paddingVertical: 100, height: 50, alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 50 }}>

                                </View>
                            )
                        }}
                        stickyHeaderIndices={[0]}
                        contentContainerStyle={{ padding: 16 }}
                        data={eventsDay}
                        scrollEnabled
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
                </View>}
            <Loading loading={loading}></Loading>
            <Toast />
        </View>
    )
}
export default Home