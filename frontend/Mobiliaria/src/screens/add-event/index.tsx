import { NavigationScreens } from "@interfaces/navigation";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
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
    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const [event, setEvent] = useState<IEventDetail>({} as IEventDetail)
    const [loading, setLoading] = useState<boolean>(false)
    const { inventaryRx, totalRx, eventRx } = useReduxEvent()
    const [total, setTotal] = useState<number>(totalRx)
    const [persentage, setPersentage] = useState<string>('')
    const [ flete, setFlete ] = useState<string>('')
    const [ iva, setIva ] = useState<boolean>(false)
    const [ openModalPicker, setOpenModalPicker] = useState<boolean>(false)

    const [typePicker, setTypePicker] = useState<{ type: number, mode: "date" | "time" | "datetime" }>({ type: ETypesPicker.Recolection, mode: 'date' })
    const [ recolectedDay, setRecolectedDay] = useState<{date: string, hour: string}>({date: '', hour: ''})
    const [deliveredDay, setDeliveredDay] = useState<{ date: string, hour: string }>({ date: '', hour: '' })
    const [ anticipo, SetAnticipo ] = useState<string>('')
    const [detailsEvent, setDetailsEvent] = useState<{ titular: string, tipo: string, telefono: string, direccion: string, nombreEvento: string }>({ nombreEvento: '', titular: '', tipo: '', telefono: '', direccion: '' })
    const [ openAlert, setOpenAlert ] = useState<boolean>(false)

    const animation = React.useRef(null);

    const { fonts, colors } = useTheme()

    const submit = async () => {    
        setLoading(true)    
        if (inventaryRx.length === 0) {
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

        if(detailsEvent.titular === '' || detailsEvent.tipo === '' || detailsEvent.telefono === '' || detailsEvent.direccion === '') {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Faltan campos por llenar',
                visibilityTime: 1000,
                autoHide: true,
                onHide: () => {
                }
            })
            return
        }

        const event: any = {
            nombre_evento: detailsEvent.nombreEvento,
            tipo_evento: detailsEvent.tipo,
            fecha_envio_evento: date,
            hora_envio_evento: deliveredDay.hour,
            fecha_recoleccion_evento: recolectedDay.date,
            hora_recoleccion_evento: recolectedDay.hour,
            nombre_titular_evento: detailsEvent.titular,
            direccion_evento: detailsEvent.direccion,
            telefono_titular_evento: detailsEvent.telefono,
            descuento: persentage ? parseInt(persentage) : 0,
            ivavalor: iva ? 1 : 0,
            fletevalor: flete ? Number(flete) : 0
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

        const costo = {
            costo_total: total,
            anticipo: anticipo,
            saldo: total - Number(anticipo)
        }

        const body = {
            evento: event,
            mobiliario: mobiliario,
            costo
        }

        try {
            const response = await eventService.addEvent(body)
            console.log(response);
            navigation.navigate('Home', { refresh: true })
            
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }
        

    useEffect(() => {
    }, [])


    const keyExtractor = (item: IAvailability, index: number): string => item.id_mob.toString() + index

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

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ padding: 10, height: '50%' }}>
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
                        <View style={{ paddingTop: 20, width: '100%' }}>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <View style={{ width: '20%' }}>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingTop: 10 }}>Nombre.- </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingTop: 10 }}>Titular.- </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingTop: 2 }}>Tipo evento.- </Text>
                                    <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingTop: 10 }}>Telefono.- </Text>
                                </View>
                                <View style={{ width: '80%', paddingEnd: 15 }}>
                                    <TextInput placeholder="Club rotario" onChangeText={(value: string) => {
                                        setDetailsEvent({ ...detailsEvent, nombreEvento: value })
                                    }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                                    <TextInput placeholder="Emilio lozada" onChangeText={(value: string) => {
                                        setDetailsEvent({...detailsEvent, titular: value})
                                    }} 
                                    style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                                    <TextInput placeholder="Boda"
                                        onChangeText={(value: string) => {
                                            setDetailsEvent({ ...detailsEvent, tipo: value })
                                        }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                                    <TextInput placeholder="5553 381 1233" keyboardType="number-pad"
                                        onChangeText={(value: string) => {
                                            setDetailsEvent({ ...detailsEvent, telefono: value })
                                        }}
                                        style={{ width: '70%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingTop: 15 }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Direccion:</Text>
                        <TextInput placeholder="Acalpa 121-173, Col del Bosque, 34108 Durango, Dgo."
                            onChangeText={(value: string) => {
                                setDetailsEvent({ ...detailsEvent, direccion: value })
                            }}
                            style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular }}></TextInput>
                        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 10 }}>Fecha: </Text>
                            <TextInput editable={false} value={date} style={{ width: '90%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} ></TextInput>

                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 10 }}>Hora de entrega: </Text>
                            <TouchableOpacity style={{ width: '75%', paddingTop: 11 }} onPress={() => {
                                setTypePicker({ type: ETypesPicker.HourDelivery, mode: 'time' })
                                setOpenModalPicker(true)

                            }}>
                                <Text style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} >{deliveredDay.hour}</Text>
                            </TouchableOpacity>
                            
                        </View>

                        <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, paddingTop: 10 }}>Fecha de recoleccion: </Text>
                        <TouchableOpacity onPress={() => {
                            setTypePicker({ type: ETypesPicker.Recolection, mode: 'date' })
                            setOpenModalPicker(true)

                        }}>
                            <Text style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }} >{recolectedDay.date}</Text>

                        </TouchableOpacity>
                       
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, marginLeft: 5, fontSize: 12, paddingTop: 10 }}>Hora de recoleccion: </Text>

                            <TouchableOpacity style={{ width: '65%', paddingTop: 11 }} onPress={() => {
                                setTypePicker({ type: ETypesPicker.HourRecolection, mode: 'time' })
                                setOpenModalPicker(true)

                            }}>
                                <Text style={{ width: '100%', borderBottomWidth: 1, paddingVertical: 1, fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>{recolectedDay.hour}</Text>
                        </TouchableOpacity>
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
                        
                        setTotal(totalRx)
                        if(flete !== '') {
                            setTotal(total + parseInt(flete))
                        }

                        if(persentage !== '') {
                            setTotal(total - (total * (parseInt(persentage) / 100)))
                        }

                        if(iva) {
                            setTotal(total + (total * .16))
                        }
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

                                <TouchableOpacity style={{ backgroundColor: '#488aff', alignItems: 'center', marginTop: 10, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 3 }}>
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
                data={inventaryRx}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={() => {
                    return (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff', fontSize: 16 }}>Agregar material</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            {/* <View style={{ height: 200 }} /> */}
            <View style={{ width: '100%', position: 'absolute', bottom: 0, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.gray400 }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: 5 }}>
                    <View style={{ height: 25, width: '30%', backgroundColor: colors.black, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Regular }}>Total
                        </Text>
                    </View>
                    <View style={{ height: 25, width: '30%', backgroundColor: colors.black, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>${total}</Text>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={submit} style={{ height: 40, width: '80%', backgroundColor: '#488aff', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
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
            <DatePickerComponent date={new Date(date)} mode={typePicker.mode} open={openModalPicker} onChangePicker={(date) => {
                console.log(date);
                setOpenModalPicker(false)
                if(!date) return
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
