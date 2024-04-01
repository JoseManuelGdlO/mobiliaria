import LottieView from "lottie-react-native"
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native"
import RNPickerSelect from 'react-native-picker-select';
import * as reportsService from '@services/reports'
import Loading from "@components/loading";
import { useTheme } from "@hooks/useTheme";
import { currencyFormat } from "@utils/dateFormat";
import { ScrollView } from "react-native-gesture-handler";

const Charts = (): JSX.Element => {
    const animation = useRef(null);
    const [intervalMonth, setIntervalMonth] = useState(1)
    const [loading, setLoading] = useState(false)
    const [reports, setReports] = useState<any>()
    const { fonts, colors } = useTheme()

    
    useEffect(() => {

        getReports()

    }, [])

    const getReports = async () => {
        try {
            setLoading(true)
            const response = await reportsService.getReports(intervalMonth)
            setReports(response)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const keyExtractor = (item: any, index: number) => index.toString()

    const renderItem = ({ item }: any) => {
        
        return (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>{item.nombre_titular_evento}</Text>
                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>{item.veces_agrupado}</Text>
            </View>
        )
    }
    
    const keyExtractorInv = (item: any, index: number) => index.toString()

    const renderInvItem = ({ item }: any) => {
        
        return (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, width: '60%' }}>{item.nombre_mobiliario}</Text>
                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>{item.veces_rentado}</Text>
                <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>{item.ocupados}</Text>
            </View>
        )
    }
    
    return (
        <ScrollView>
            <View style={{  display: 'flex', flexDirection: 'row'  }}>
                <LottieView
                        ref={animation}
                        autoPlay
                        loop={true}
                        style={{
                            width: '30%',
                            height: 160,
                            backgroundColor: 'transparent',
                        }}
                        // Find more Lottie files at https://lottiefiles.com/featured
                        source={require('../../assets/images/lottie/chart.json')}
                    />
                <View>
                    <Text style={{ width: "60%", paddingTop: 30, paddingRight: 10}}>
                        Aqui veras reflejada una lista de estadisticas, referente a tus rentas, pagos y eventos
                    </Text>
                    <Text style={{ width: "70%", paddingTop: 5, paddingRight: 10}}>
                        Selecciona el intervalo de tiempo
                    </Text>
                    <View style={{ borderBottomColor: '#CCCC', borderBottomWidth: 1, width: '50%' }}>
                        <RNPickerSelect
                                key={1}
                                placeholder="Seleciona los meses a consultar"
                                value={intervalMonth}
                                onValueChange={(value) => {
                                    setIntervalMonth(value)
                                    getReports()
                                }}
                                items={[
                                    { label: '1 mes atras', value: 1 },
                                    { label: '2 meses atras', value: 2 },
                                    { label: '3 meses atras', value: 3 },
                                    { label: '4 meses atras', value: 4 },
                                    { label: '5 meses atras', value: 5 },
                                    { label: '6 meses atras', value: 6 },
                                    { label: '7 meses atras', value: 7 },
                                    { label: '9 meses atras', value: 8 },
                                    { label: '10 meses atras', value: 9 },
                                    { label: '11 meses atras', value: 10 },
                                    { label: '12 meses atras', value: 11 },
                                ]}
                            />
                    </View>
                </View>

            </View>
            <View style={{paddingHorizontal: 8, paddingBottom: 10}}>
                <View style={{
                        padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1
                    }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Eventos en {intervalMonth} mes{intervalMonth>1?'es':''} </Text>
                        <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Total Generado: <Text style={{ color: '#9E2EBE', fontWeight: 'bold'}}>{currencyFormat(reports?.eventos?.total)}</Text></Text>
                        <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Todal de eventos: <Text style={{ color: '#9E2EBE', fontWeight: 'bold'}}>{reports?.eventos?.numero_eventos}</Text></Text>
                        <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Promedio en costo rentado por evento: <Text style={{ color: '#9E2EBE', fontWeight: 'bold'}}>{currencyFormat(reports?.eventos?.promedio)}</Text></Text>
                </View>
                <View style={{
                        padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, marginTop: 10
                    }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Clientes lealtad </Text>
                        <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>
                            Aqui unl lista de tus clientes quienes mas han rentado en el ultimo intervalo de tiempo
                        </Text>
                        <FlatList
                            style={{ paddingTop: 10}}
                            ListHeaderComponent={() => <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Nombre</Text>
                                <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Veces rentado</Text>
                            </View>}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                            data={reports?.Quantity}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                        />
                </View>
                <View style={{
                        padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, marginTop: 10
                    }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Mobiliario rentado </Text>
                        <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>
                            Aqui una lista de tus productos mas rentados en el ultimo intervalo de tiempo
                        </Text>
                        <FlatList
                            style={{ paddingTop: 10}}
                            ListHeaderComponent={() => <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                <Text style={{ color: '#9E2EBE', width: '60%', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Nombre</Text>
                                <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Rentado</Text>
                                <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>Cantidad</Text>
                            </View>}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                            data={reports?.mostRent}
                            renderItem={renderInvItem}
                            keyExtractor={keyExtractorInv}
                        />
                </View>
            </View>
            <Loading loading={loading}></Loading>
        </ScrollView>
    )
}

export default Charts