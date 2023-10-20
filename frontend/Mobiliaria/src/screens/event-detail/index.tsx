import { NavigationScreens } from "@interfaces/navigation";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import * as eventService from '../../services/events';
import Loading from "@components/loading";
import LottieView from "lottie-react-native";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import { IEventDetail, IInventaryRent } from "@interfaces/event-details";

const EventDetail = ({ route: { params: { id } } }: StackScreenProps<NavigationScreens, 'EventDetail'>): JSX.Element => {
    const [event, setEvent] = useState<IEventDetail>({} as IEventDetail)
    const [loading, setLoading] = useState<boolean>(true)

    const animation = React.useRef(null);

    const { fonts, colors } = useTheme()

    const getDetails = async () => {
        try {
            const response = await eventService.getEventDetail(id) as IEventDetail
            console.log(response.payments);
            
            setEvent(response)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        setLoading(true)
        getDetails()
    }, [])


    const keyExtractor = (item: IInventaryRent, index: number): string => item.id_mob.toString() + index

    const renderItem = ({
        item,
        index
    }: {
        item: IInventaryRent
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
                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{item.ocupados} Rentado{item.ocupados !== 1 && 's'}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'red', paddingTop: 10 }}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <>
            <View style={{ padding: 10 }}>
                <View style={{
                    padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, overflow: 'hidden', shadowRadius: 10, shadowOpacity: 1,
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
                        <View style={{ paddingTop: 20 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>Titular.- {event?.event?.nombre_titular_evento}</Text>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12 }}>Evento.- {event?.event?.nombre_evento} </Text>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12 }}>Telefono.- {event?.event?.telefono_titular_evento} </Text>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Direccion: {event?.event?.direccion_evento}</Text>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>Fecha y Hora: {event?.event?.fecha_envio_evento.split('T')[0]} a las {event?.event?.hora_envio_evento}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
                            <LottieView
                                ref={animation}
                                autoPlay
                                loop={true}
                                style={{
                                    zIndex: 10,
                                    width: 25,
                                    height: 25,
                                    backgroundColor: 'transparent',
                                }}
                                // Find more Lottie files at https://lottiefiles.com/featured
                                source={event?.event?.entregado === 0 ? require('../../assets/images/lottie/sad.json') : require('../../assets/images/lottie/happy.json')}
                            />
                            <Text style={{
                                fontFamily: fonts.Roboto.Regular,
                                fontSize: 12,
                                paddingTop: 5,
                                backgroundColor: event?.event?.entregado === 0 ? 'rgba(0, 0, 0, 0.12)' : '#488aff',
                                paddingHorizontal: 15,
                                color: event?.event?.entregado === 0 ? 'rgba(0, 0, 0, 0.87)' : '#fff',
                                marginLeft: -10,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                {event?.event?.entregado === 0 ? 'No entregado' : 'Entregado'}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
                            <LottieView
                                ref={animation}
                                autoPlay
                                loop={true}
                                style={{
                                    zIndex: 10,
                                    width: 25,
                                    height: 25,
                                    backgroundColor: 'transparent',
                                }}
                                // Find more Lottie files at https://lottiefiles.com/featured
                                source={event?.event?.recolectado === 0 ? require('../../assets/images/lottie/sad.json') : require('../../assets/images/lottie/happy.json')}
                            />
                            <Text style={{
                                fontFamily: fonts.Roboto.Regular,
                                fontSize: 12,
                                paddingTop: 5,
                                backgroundColor: event?.event?.recolectado === 0 ? 'rgba(0, 0, 0, 0.12)' : '#488aff',
                                paddingHorizontal: 15,
                                color: event?.event?.recolectado === 0 ? 'rgba(0, 0, 0, 0.87)' : '#fff',
                                marginLeft: -10,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                {event?.event?.recolectado === 0 ? 'No recolectado' : 'Recolectado'}</Text>
                        </View>
                        {/* <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 20, paddingHorizontal: 30, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Black, fontSize: 12, color: colors.black }}>Eliminar</Text>
                        </TouchableOpacity> */}
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginTop: 10
                    }}>
                        <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, paddingTop: 5 }}>Observaciones </Text>
                        <TouchableOpacity style={{ backgroundColor: '#488aff', alignItems: 'center', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, color: colors.black }}>Agregar Obs</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', width: '100%', minHeight: 30, borderRadius: 8, marginTop: 5, paddingHorizontal: 10, paddingBottom: 8 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 5 }}>{event?.event?.observaciones}</Text>
                    </View>
                </View>
            </View>
            { event && event.payments &&
                <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                    <View style={{
                        padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, overflow: 'hidden', shadowRadius: 10, shadowOpacity: 1,
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

                                <TouchableOpacity style={{ backgroundColor: '#488aff', alignItems: 'center', marginTop:10, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
                                    <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, color: colors.black }}>Agregar abono</Text>
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
            <FlatList
                style={{ paddingTop: 10 }}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                data={event?.items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={() => {
                    return (
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 16 }}>Agregar material</Text>
                        </TouchableOpacity>
                    )
                } }
            />
            <TouchableOpacity style={{ width: '100%', height: 50, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 0 }}>
                <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 20 }}>Eliminar evento</Text>
            </TouchableOpacity>
            <Loading loading={loading}></Loading>

        </>
    )
}

export default EventDetail
