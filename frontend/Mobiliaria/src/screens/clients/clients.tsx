import Loading from "@components/loading";
import { IClients } from "@interfaces/clients";
import LottieView from "lottie-react-native";
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import * as clientsService from '../../services/clients'
import { useTheme } from "@hooks/useTheme";

const Clients = (): JSX.Element => {
    const animation = useRef(null);
    const [workers, setWorkers] = React.useState<IClients[]>([])
    const [loading, setLoading] = React.useState(false)

    const { fonts, colors } = useTheme()

    const getWorkers = async () => {
        setLoading(true)
        try {
            const workers = await clientsService.getClients() as IClients[]
            setWorkers(workers)

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        getWorkers()
    }, [])


    const keyExtractor = (item: IClients, index: number): string => item.id_cliente.toString()

    const renderItem = ({
        item,
        index
    }: {
        item: IClients
        index: number
    }): JSX.Element => {
        return (
            <View style={{ padding: 10 }}>
                <View style={{
                    padding: 10, borderColor: '#9E2EBE', borderRadius: 5, borderWidth: 1, overflow: 'hidden', shadowColor: 'yourchoice', shadowRadius: 10, shadowOpacity: 1,
                }}>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <LottieView
                            ref={animation}
                            autoPlay
                            loop={true}
                            style={{
                                width: 60,
                                height: 60,
                                backgroundColor: 'transparent',
                            }}
                            // Find more Lottie files at https://lottiefiles.com/featured
                            source={require('../../assets/images/lottie/user.json')}
                        />
                        <View style={{ paddingTop: 10 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>{item.nombre_cliente}</Text>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12 }}>Telefono {item.telefono_cliente}</Text>
                        </View>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                        <View style={{ paddingHorizontal: 10, width: '70%' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>Direccion</Text>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, color: '#488aff' }}>{item.correo_cliente}</Text>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 20, paddingHorizontal: 30, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Black, fontSize: 12, color: colors.black }}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        )
    }

    return (
        <>
            <View>
                <LottieView
                    ref={animation}
                    autoPlay
                    loop={true}
                    style={{
                        width: '100%',
                        height: 250,
                        backgroundColor: 'transparent',
                    }}
                    // Find more Lottie files at https://lottiefiles.com/featured
                    source={require('../../assets/images/lottie/clients.json')}
                />
            </View>
            <FlatList
                data={workers}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
            <Loading loading={loading} />
        </>
    )
}
export default Clients