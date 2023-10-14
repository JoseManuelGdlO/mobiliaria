import React, { useEffect } from "react"
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { CalendarList } from 'react-native-calendars'
import { LocaleConfig } from 'react-native-calendars';
import { Dimensions } from 'react-native';
import * as eventService from '../../services/events';
import { MarkedDates } from "react-native-calendars/src/types";
import { useTheme } from "@hooks/useTheme";
import CardEvents from "@components/CardEvents";
import { monthToString } from "@utils/dateFormat";
import { Skeleton } from "@rneui/themed/dist/Skeleton";
import { LinearGradient } from "react-native-svg";

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


const Home = (): JSX.Element => {
    const [dates, setDates] = React.useState<MarkedDates>({});
    const [eventsDay, setEventsDay] = React.useState<any>([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [dateEvent, setDateEvent] = React.useState('');
    const [loading, setLoading] = React.useState<boolean>(false);

    const { colors, fonts } = useTheme();

    const getColorSpecific = (number: number): string => {
        if (number < 3) {
            return '#ff9a9a'
        } else if (number < 5) {
            return '#7f0101'
        } else if (number < 8) {
            return '#4c0000'
        }
        return 'transparent'
    }

    const getEvents = async () => {
        try {
            const response = await eventService.getEvents()
            const groupedKeys = response.data.reduce((group: { [key: string]: any }, item: any) => {
                if (!group[item.fecha_envio_evento.split('T')[0]]) {
                    group[item.fecha_envio_evento.split('T')[0]] = 1;
                }
                group[item.fecha_envio_evento.split('T')[0]] = group[item.fecha_envio_evento.split('T')[0]] + 1;
                return group;
            }, {});

            const dates: MarkedDates = {}
            for (const date in groupedKeys) {
                dates[date] = {
                    selected: true,
                    marked: false,
                    selectedColor: getColorSpecific(groupedKeys[date]),
                }
            }
            setDates(dates)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
        }

    }

    const getEventsDay = async (date: string) => {
        try {

            const response = await eventService.getEventsDay(date)
            console.log(response.data);

            setEventsDay(response.data)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
            setLoading(false)
        }

    }

    const keyExtractor = (item: (any), index: number): string => index.toString()

    const onRefresh = React.useCallback(() => {
        setLoading(true)
        setRefreshing(true);
        const date = new Date().toISOString().split('T')[0]
        getEventsDay(date)
        getEvents()
    }, []);

    useEffect(() => {
        setLoading(true)
        setRefreshing(true);
        getEvents()
        const date = new Date().toISOString().split('T')[0]
        const arrDate = date.split('-')
        setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)
        getEventsDay(date)
    }, [])

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
                onDayPress={(day: any) => {
                    const date = day.dateString
                    const arrDate = date.split('-')
                    setDateEvent(`${arrDate[2]} de ${monthToString(Number(arrDate[1]))}`)
                    getEventsDay(date)
                }}
                // Enable horizontal scrolling, default = false
                horizontal={true}
                // Enable paging on horizontal, default = false
                pagingEnabled={true}
                // Set custom calendarWidth.
                calendarWidth={Dimensions.get('window').width}
                markedDates={dates}
            />
            {loading
                ? <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', borderTopLeftRadius: 8, paddingHorizontal: 30, paddingVertical: 25, borderTopRightRadius: 8, marginTop: -25, height: '100%' }}>
                    <Skeleton animation="pulse" width={175} height={20} />
                    <Skeleton animation="pulse" style={{ borderRadius: 8, marginTop: 15 }} width={350} height={180} />
                    <Skeleton animation="pulse" style={{ borderRadius: 8, marginTop: 15 }} width={350} height={180} />
                </View>
                :
                <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', borderTopLeftRadius: 8, borderTopRightRadius: 8, marginTop: -25 }}>
                    <FlatList
                        ListHeaderComponent={() => {
                            return (
                                <Text style={{ color: colors.white, fontSize: 15, fontWeight: '100', marginVertical: 8, paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular }}>
                                    Eventos del dia <Text style={{ fontWeight: '500', color: '#153acb', fontFamily: fonts.Roboto.BlackItalic, fontStyle: 'italic' }}>{dateEvent}</Text>
                                </Text>
                            )
                        }}
                        ListEmptyComponent={() => {
                            return (
                                <View style={{ backgroundColor: 'rgba(148, 167, 244, 0.79)', paddingVertical:100, height: 350, alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 50 }}>
                                    <Text style={{ color: colors.white, fontSize: 15, fontWeight: '100', marginVertical: 8, paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular }}>
                                        No hay eventos para este dia 😪
                                    </Text>
                                </View>
                            )
                        }}
                        contentContainerStyle={{ padding: 16 }}
                        data={eventsDay}
                        scrollEnabled
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
                </View>}
            </ScrollView>
        </View>
    )
}
export default Home