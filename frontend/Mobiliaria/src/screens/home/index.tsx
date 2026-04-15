import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Dimensions, FlatList, PermissionsAndroid, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { CalendarList } from 'react-native-calendars'
import { LocaleConfig } from 'react-native-calendars';
import * as eventService from '../../services/events';
import * as authService from '../../services/auth';
import { MarkedDates } from "react-native-calendars/src/types";
import { useTheme } from "@hooks/useTheme";
import CardEvents from "@components/CardEvents";
import { getLocalYmd, monthToString } from "@utils/dateFormat";
import Loading from "@components/loading";
import PrimaryButton from "@components/PrimaryButton";
import { NavigationScreens } from "@interfaces/navigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import messaging from '@react-native-firebase/messaging';
import useReduxUser from "@hooks/useReduxUser";
import Toast from "react-native-toast-message";
import { sendLocationWS } from "@utils/locationForegraund";
import { refreshHomeWidgetSnapshot } from "@widgets/refreshHomeWidgetSnapshot";
import { requestWidgetRefresh } from "@widgets/widgetSync";

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
    const [dates, setDates] = useState<MarkedDates>({});
    const [eventsDay, setEventsDay] = useState<any>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [dateEvent, setDateEvent] = useState(() => {
        const d = getLocalYmd()
        const arr = d.split('-')
        return `${arr[2]} de ${monthToString(Number(arr[1]))}`
    });
    const [total, setTotal] = useState('0');
    const [loading, setLoading] = useState<boolean>(false);
    const [requestDate, setRequestDate] = useState(() => getLocalYmd());
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(() => getLocalYmd());

    const { colors, fonts } = useTheme();

    const { user, token } = useReduxUser()

    const requestUserPermissions = async () => {

        if(Platform.OS === 'android') {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
        const authStatus = await messaging().requestPermission();
        const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            getToken();
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
    }   


    const addEvent = () => { 
        navigation.navigate('Available', { date: requestDate })
    }

    const openDesignFlow = () => {
        navigation.navigate('DesignEvent')
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
                    marked: true,
                    dotColor: getColorSpecific(date.total),
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


    const keyExtractor = (item: any, index: number): string =>
        item?.id_evento != null ? String(item.id_evento) : `ev-${index}`

    const onRefresh = useCallback(() => {
        setLoading(true)
        setRefreshing(true)
        const date = getLocalYmd()
        const arr = date.split('-')
        setRequestDate(date)
        setSelectedCalendarDay(date)
        setDateEvent(`${arr[2]} de ${monthToString(Number(arr[1]))}`)
        getEventsDay(date)
        getEvents()
        refreshHomeWidgetSnapshot().catch(() => {})
    }, []);

    const markedDatesDisplay = useMemo((): MarkedDates => {
        const merged: MarkedDates = { ...dates }
        const sel = selectedCalendarDay
        const prev = merged[sel] ?? {}
        merged[sel] = {
            ...prev,
            selected: true,
            selectedColor: colors.Morado600,
            selectedTextColor: colors.white,
        }
        return merged
    }, [dates, selectedCalendarDay, colors.Morado600, colors.white])

    const calendarTheme = useMemo(
        () => ({
            calendarBackground: colors.background_parts.card,
            backgroundColor: colors.background_parts.card,
            monthTextColor: colors.Griss50,
            textMonthFontFamily: fonts.Inter.SemiBold,
            textMonthFontSize: 17,
            dayTextColor: colors.Griss100,
            textDayFontFamily: fonts.Inter.Medium,
            textDayFontSize: 15,
            textDayHeaderColor: colors.gris300,
            textDayHeaderFontFamily: fonts.Inter.Medium,
            textDayHeaderFontSize: 12,
            textSectionTitleColor: colors.gris300,
            todayTextColor: colors.Morado100,
            todayBackgroundColor: `${colors.Morado600}22`,
            selectedDayBackgroundColor: colors.Morado600,
            selectedDayTextColor: colors.white,
            textDisabledColor: colors.gris400,
            dotColor: colors.Morado100,
            selectedDotColor: colors.white,
        }),
        [colors, fonts],
    )

    const sheetStyles = useMemo(
        () =>
            StyleSheet.create({
                root: {
                    flex: 1,
                    backgroundColor: colors.background_parts.header,
                },
                calendarShell: {
                    marginHorizontal: 14,
                    marginTop: 10,
                    marginBottom: 6,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: colors.background_parts.card,
                    ...Platform.select({
                        ios: {
                            shadowColor: colors.black,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.35,
                            shadowRadius: 14,
                        },
                        android: { elevation: 10 },
                    }),
                },
                calendarHeader: {
                    paddingHorizontal: 18,
                    paddingTop: 16,
                    paddingBottom: 6,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.gris400,
                },
                calendarTitle: {
                    color: colors.Griss50,
                    fontFamily: fonts.Inter.SemiBold,
                    fontSize: 18,
                    letterSpacing: 0.2,
                },
                calendarSubtitle: {
                    marginTop: 4,
                    color: colors.gris300,
                    fontFamily: fonts.Inter.Regular,
                    fontSize: 13,
                },
                eventsIntro: {
                    backgroundColor: colors.DarkViolet300,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    marginTop: -8,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                    paddingBottom: 6,
                },
                chipRow: {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                },
                dateChip: {
                    backgroundColor: `${colors.Morado600}33`,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: `${colors.Morado100}44`,
                },
                dateChipText: {
                    color: colors.Griss50,
                    fontFamily: fonts.Inter.SemiBold,
                    fontSize: 14,
                },
                totalPill: {
                    backgroundColor: `${colors.primario500}29`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                },
                totalPillText: {
                    color: colors.primario300,
                    fontFamily: fonts.Inter.Medium,
                    fontSize: 12,
                },
                legendRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginTop: 4,
                    marginBottom: 10,
                    gap: 12,
                },
                legendItem: {
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                legendDot: {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginRight: 6,
                },
                legendLabel: {
                    color: colors.gris300,
                    fontFamily: fonts.Inter.Regular,
                    fontSize: 11,
                },
                emptyWrap: {
                    paddingVertical: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                emptyText: {
                    color: colors.gris300,
                    fontFamily: fonts.Inter.Regular,
                    fontSize: 15,
                    textAlign: 'center',
                },
            }),
        [colors, fonts],
    )

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true)
            getEvents()
            getEventsDay(requestDate)
            refreshHomeWidgetSnapshot().catch(() => {})
        })

        return unsubscribe
    }, [navigation, requestDate])

    useEffect(() => {
        requestUserPermissions()
        subscribeNotifications()
        requestWidgetRefresh().catch(() => {})
        let cleanup: undefined | (() => Promise<void>)
        sendLocationWS(user, { token }).then((stopFn) => {
            cleanup = stopFn
        })

        const date = getLocalYmd()
        const arrDate = date.split('-')
        setRequestDate(date)
        setSelectedCalendarDay(date)
        setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)

        setLoading(true)
        getEvents()
        getEventsDay(date)
        refreshHomeWidgetSnapshot().catch(() => {})

        if (refresh) {
            setLoading(true)
            getEvents()
        }

        return () => {
            if (cleanup) {
                cleanup()
            }
        }
    }, [])

    const calendarInnerWidth = Dimensions.get('window').width - 28

    const listHeader = (
        <View>
            <View style={sheetStyles.calendarShell}>
                <View style={sheetStyles.calendarHeader}>
                    <Text style={sheetStyles.calendarTitle}>Tu agenda</Text>
                    <Text style={sheetStyles.calendarSubtitle}>
                        Desliza entre meses y toca un día para ver los eventos
                    </Text>
                    <View style={sheetStyles.legendRow}>
                        <View style={sheetStyles.legendItem}>
                            <View style={[sheetStyles.legendDot, { backgroundColor: getColorSpecific(1) }]} />
                            <Text style={sheetStyles.legendLabel}>Pocos</Text>
                        </View>
                        <View style={sheetStyles.legendItem}>
                            <View style={[sheetStyles.legendDot, { backgroundColor: getColorSpecific(4) }]} />
                            <Text style={sheetStyles.legendLabel}>Varios</Text>
                        </View>
                        <View style={sheetStyles.legendItem}>
                            <View style={[sheetStyles.legendDot, { backgroundColor: getColorSpecific(8) }]} />
                            <Text style={sheetStyles.legendLabel}>Muchos</Text>
                        </View>
                    </View>
                </View>
                <CalendarList
                    theme={calendarTheme}
                    firstDay={1}
                    hideExtraDays
                    horizontal
                    pagingEnabled
                    calendarWidth={calendarInnerWidth}
                    markedDates={markedDatesDisplay}
                    onDayPress={async (day: { dateString: string }) => {
                        const date = day.dateString
                        const arrDate = date.split('-')
                        setLoading(true)
                        setSelectedCalendarDay(date)
                        setRequestDate(`${arrDate[0]}-${arrDate[1]}-${arrDate[2]}`)
                        setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)
                        await getEventsDay(date)
                        setLoading(false)
                    }}
                />
            </View>
            <View style={sheetStyles.eventsIntro}>
                <Text
                    style={{
                        color: colors.gris300,
                        fontFamily: fonts.Inter.Medium,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        marginBottom: 8,
                    }}
                >
                    Eventos del día
                </Text>
                <View style={sheetStyles.chipRow}>
                    <View style={sheetStyles.dateChip}>
                        <Text style={sheetStyles.dateChipText}>{dateEvent}</Text>
                    </View>
                    {total !== '0' && (
                        <View style={sheetStyles.totalPill}>
                            <Text style={sheetStyles.totalPillText}>Corte: {total}</Text>
                        </View>
                    )}
                </View>
                <PrimaryButton
                    containerStyle={{ width: '100%', paddingVertical: 4, marginBottom: 4 }}
                    textStyle={{
                        fontSize: 14,
                        fontFamily: fonts.Inter.SemiBold,
                        color: colors.white,
                    }}
                    backgroundButton={colors.Morado600}
                    onPress={addEvent}
                    title="Crear nuevo evento"
                />
                <PrimaryButton
                    containerStyle={{
                        width: '100%',
                        paddingVertical: 4,
                        marginBottom: 4,
                        borderWidth: 1,
                        borderColor: colors.Morado100,
                    }}
                    textStyle={{
                        fontSize: 14,
                        fontFamily: fonts.Inter.SemiBold,
                        color: colors.Morado100,
                    }}
                    backgroundButton='transparent'
                    onPress={openDesignFlow}
                    title="Diseña tu evento premium"
                />
            </View>
        </View>
    )

    return (
        <View style={sheetStyles.root}>
            <FlatList
                style={{ flex: 1 }}
                data={eventsDay}
                keyExtractor={keyExtractor}
                nestedScrollEnabled
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={Platform.OS === 'android'}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={
                    <View style={[sheetStyles.emptyWrap, { paddingHorizontal: 16 }]}>
                        <Text style={sheetStyles.emptyText}>
                            No hay eventos para este día. Toca otro día o crea uno nuevo.
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.Morado100}
                        colors={[colors.Morado600]}
                    />
                }
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 120,
                    backgroundColor: colors.DarkViolet300,
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
                        <CardEvents data={item} />
                    </View>
                )}
            />
            <Loading loading={loading} />
            <Toast />
        </View>
    )
}
export default Home