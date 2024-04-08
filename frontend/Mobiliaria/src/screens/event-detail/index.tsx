import { NavigationScreens } from "@interfaces/navigation";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import * as eventService from '../../services/events';
import Loading from "@components/loading";
import LottieView from "lottie-react-native";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import { IEventDetail, IInventaryRent, IPayment } from "@interfaces/event-details";
import Toast from "react-native-toast-message";
import * as paymentService from '../../services/payments';
import AreYouSure from "@components/are-you-suere-modal";
import { useNavigation } from "@react-navigation/native";

const EventDetail = ({
    route
}: StackScreenProps<NavigationScreens, 'EventDetail'>): JSX.Element => {
    
    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const id = route.params.id
    const [event, setEvent] = useState<IEventDetail>({} as IEventDetail)
    const [itemRemove, setItemRemove] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [abono, setAbono] = useState<string>('')
    const [obs, setObs] = useState<string>('')
    const [openAlert, setOpenAlert] = useState<number>(0)

    const animation = React.useRef(null);

    const { fonts, colors } = useTheme()

    const getDetails = async () => {
        try {
            const response = await eventService.getEventDetail(id) as IEventDetail
            setObs(response?.event?.observaciones)
            
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
                <TouchableOpacity onPress={() => {                    
                    setItemRemove(item.id_mob)
                    setOpenAlert(3)
                }}>
                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'red', paddingTop: 10 }}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const changeStatus = async () => {
        if (event?.event?.entregado === 0) {
            event.event.entregado = 1
            setEvent(event)
        } else if(event?.event?.recolectado === 0) {
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

    return (
        <>
            <ScrollView>
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
                            <TouchableOpacity
                                onPress={() => setOpenAlert(1)}
                                style={{ backgroundColor: '#488aff', borderRadius: 20, paddingHorizontal: 15, justifyContent: 'center' }}>
                                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 10, color: colors.black }}>
                                        {event?.event?.entregado === 0 ? 'Entregar' : 'Recolectar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginTop: 10
                        }}>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, paddingTop: 5 }}>Observaciones </Text>
                            <TouchableOpacity
                                onPress={async () => {

                                if (obs === event.event.observaciones) {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Error',
                                        text2: 'No hay cambios en las observaciones',
                                        visibilityTime: 1000,
                                        autoHide: true
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
                                        autoHide: true
                                    })
                                    getDetails()

                                } catch (error) {
                                    console.log(error);
                                    setLoading(false)
                                }

                            }}
                                 style={{ backgroundColor: '#488aff', alignItems: 'center', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
                                <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12, color: colors.black }}>Agregar Obs</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', width: '100%', minHeight: 30, borderRadius: 8, marginTop: 5, paddingHorizontal: 10, paddingBottom: 8 }}>
                            <TextInput placeholder="agrega aqui si tienes observaciones" onChangeText={setObs} value={obs} style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 5 }}></TextInput>
                        </View>
                    </View>
                </View>
                {event && event.payments &&
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
                                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Costo del evento.- {event?.payments[event?.payments.length-1]?.costo_total.toFixed(2)} </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Anticipo.- {event?.payments[event?.payments.length-1]?.anticipo} </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Saldo al corte.- {event?.payments[event?.payments.length-1]?.saldo.toFixed(2)} </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.MediumItalic, marginTop: 5, fontSize: 12 }}>Abonos </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{event?.payments.map((item, index) => {
                                        const comma = index !== event?.payments.length+1 ? ', ' : ''
                                        
                                        if(!item.abono) return
                                        return item.abono + comma
                                    })} </Text>


                                    <TextInput placeholder="Ingrese abono" onChangeText={setAbono}
                                        style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                                    <TouchableOpacity disabled={abono.length === 0} onPress={ async () => {
                                        
                                        console.log(event?.payments, abono);
                                        
                                        if (Number(abono) > event?.payments[event?.payments.length-1]?.saldo) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'El abono es mayor al saldo',
                                                visibilityTime: 1000,
                                                autoHide: true
                                            })                             
                                            return
                                        }
                                        setLoading(true)
                                        const body = {
                                            saldo: event?.payments[event?.payments.length-1]?.saldo - Number(abono),
                                            abono: Number(abono),
                                            id_evento: event?.event?.id_evento,
                                            total: event?.payments[event?.payments.length-1]?.costo_total,
                                            anticipo: event?.payments[event?.payments.length-1]?.anticipo
                                        }
                                        
                                        try {
                                            await paymentService.addPayment(body)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Hecho',
                                                text2: 'se ha abonado al evento',
                                                visibilityTime: 1000,
                                                autoHide: true
                                            })
                                            
                                        getDetails()
                                        } catch (error) {
                                            console.log(error);
                                            setLoading(false)
                                        }

                                    }} style={{ backgroundColor: abono.length !== 0 ? '#488aff' : colors.gray500, alignItems: 'center', marginTop: 10, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
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
                                    source={require('../../assets/images/lottie/followpayment.json')}
                                />
                            </View>
                        </View>
                    </View>
                }
                <FlatList
                    style={{ paddingTop: 10, paddingBottom: 70}}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                    data={event?.items}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListFooterComponent={() => {
                        return (
                            <TouchableOpacity onPress={addItems} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 16 }}>Agregar material</Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </ScrollView>
            <TouchableOpacity onPress={() => {
                setOpenAlert(2)
            }} style={{ width: '100%', height: 50, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 0 }}>
                <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 20 }}>Eliminar evento</Text>
            </TouchableOpacity>
            <Loading loading={loading}></Loading>
            <Toast />
            <AreYouSure open={openAlert !== 0} sure={() => {
                
                if(openAlert === 1) {
                    changeStatus()
                } else if(openAlert === 2){
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
            ></AreYouSure>
        </>
    )
}

export default EventDetail
