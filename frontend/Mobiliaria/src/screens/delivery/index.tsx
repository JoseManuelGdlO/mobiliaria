import { useTheme } from "@hooks/useTheme"
import { convertirEspLetra, mesEspanol } from "@utils/dateFormat"
import React, { useEffect } from "react"
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as workersService from '@services/workers'
import Loading from "@components/loading"
import { Dimensions } from 'react-native';
import { IEventDelivery, IInvDelivery } from "@interfaces/event-delivery"
import PrimaryButton from "@components/PrimaryButton"
const windowWidth = Dimensions.get('window').width;

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

    const { fonts, colors } = useTheme()

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
                        width: windowWidth / 5,
                        backgroundColor: item.selected ? '#9E2EBE' : 'white',
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        height: 100,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: item.selected ? 0 : 1,
                        borderColor: '#9E2EBE'
                    }}>
                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: item.selected ? colors.black : 'rgb(111 96 129)', fontSize: 20 }}>{item.letter}</Text>
                    <Text style={{ fontFamily: fonts.Roboto.Regular, paddingTop: 5, color: item.selected ? colors.black : 'rgb(111 96 129)', fontSize: 16 }}>{item.dayNumber}</Text>
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
            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                <View style={{
                    shadowColor: '#171717',
                    shadowOffset: { width: -2, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    width: '100%',
                }}>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Bold, fontSize: 15 }}>{item.nombre_evento}</Text>
                        <Text style={{ paddingTop: 5, color: '#9E2EBE', fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{item.nombre_titular_evento}</Text>
                        <Text style={{ paddingTop: 10, fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{item.telefono_titular_evento}</Text>
                    </View>
                    <View>
                        <Text style={{ color: '#488aff', paddingTop: 10, fontFamily: fonts.Roboto.Regular, fontSize: 14, width: 300 }}>Envio</Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12 }}>Direccion.- {item.direccion_evento}</Text>
                        <Text style={{ fontFamily: fonts.Inter.Bold, fontSize: 12 }}>Hora de {item.tipo_evento === 'recoleccion' ? 'recoleccion.- ' + item.hora_recoleccion_evento : 'envio.- ' + item.hora_envio_evento}</Text>
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
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', backgroundColor: String(index / 2).includes('.') ? 'none' : colors.gray400 }}>
                                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12 }}>{item.nombre_mob}</Text>
                                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12 }}>{item.ocupados}</Text>
                                    </View>
                                )

                            }}
                            keyExtractor={(item, index) => index.toString() + item.id_mob.toString()}
                        />
                    </View>
                    <View>
                        <Text style={{ color: '#488aff', paddingTop: 10, fontFamily: fonts.Roboto.Regular, fontSize: 14, width: 300 }}>Tus Observaciones</Text>
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', width: '100%', minHeight: 30, borderRadius: 3, marginTop: 5, paddingHorizontal: 10, paddingBottom: 8 }}>
                            <TextInput
                                style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, width: '100%', minHeight: 30 }}
                            />
                        </View>
                        <PrimaryButton
                            containerStyle={{ width: '100%', paddingVertical: 5, marginTop: 10 }}
                            backgroundButton={item.tipo_evento === 'recoleccion' ? 'red' : '#9E2EBE'}
                            onPress={() => console.log('hola')}
                            title={item.tipo_evento === 'recoleccion' ? 'INVENTARIO RECOGIDO' : 'INVENTARIO ENTREGADO'}
                        />

                    </View>
                </View>
            </View>
        )
    }

    useEffect(() => {
        getDates()

    }, [])

    return (
        <View style={{ backgroundColor: 'rgb(240, 246, 255)', height: '100%' }}>
            <View style={{ width: '100%', alignContent: 'center', justifyContent: 'center' }}>
                <FlatList
                    ListHeaderComponent={() => {
                        return (
                            <View style={{ backgroundColor: 'rgb(240, 246, 255)' }} key={0}>
                                <FlatList
                                    data={days}
                                    horizontal
                                    style={{ flexGrow: 0, width: '100%' }}
                                    contentContainerStyle={{ paddingBottom: 10, flexGrow: 0, width: '100%' }}
                                    renderItem={renderItem}
                                    keyExtractor={keyExtractor}
                                    showsHorizontalScrollIndicator={false}
                                />
                                <View key={2}>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, paddingHorizontal: 18 }}>Eventiva Delivery</Text>
                                </View>
                            </View>
                        )
                    }
                    }
                    stickyHeaderIndices={[0]}
                    data={events}
                    style={{ flexGrow: 0, width: '100%' }}
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