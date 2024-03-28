import LottieView from "lottie-react-native"
import { useRef, useState } from "react";
import { Text, View } from "react-native"
import RNPickerSelect from 'react-native-picker-select';

const Charts = (): JSX.Element => {
    
    const animation = useRef(null);
    const [intervalMonth, setIntervalMonth] = useState(1)
    return (
        <>
            <View style={{  display: 'flex', flexDirection: 'row'  }}>
                <LottieView
                        ref={animation}
                        autoPlay
                        loop={true}
                        style={{
                            width: '30%',
                            height: 220,
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
                                placeholder="Seleciona los meses a consultar"
                                value={intervalMonth}
                                onValueChange={(value) => setIntervalMonth(value)}
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
        </>
    )
}

export default Charts