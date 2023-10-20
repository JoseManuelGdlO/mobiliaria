import Loading from "@components/loading"
import { IWorker } from "@interfaces/workers"
import React, { useEffect, useRef } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import * as workersService from '../../services/workers';
import LottieView from "lottie-react-native";
import { useTheme } from "@hooks/useTheme";

const Workers = (): JSX.Element => {
    const animation = useRef(null);
    const [workers, setWorkers] = React.useState<IWorker[]>([])
    const [loading, setLoading] = React.useState(false)

    const { fonts, colors } = useTheme()

    const getWorkers = async () => {
        setLoading(true)
        try {
            const workers = await workersService.getWorkers() as IWorker[]
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


    const keyExtractor = (item: IWorker, index: number): string => item.id_usuario.toString()

    const renderItem = ({
        item,
        index
    }: {
        item: IWorker
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
                            <Text style={{ fontFamily: fonts.Roboto.Bold }}>{item.nombre_comp}</Text>
                            <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 12 }}>Creacion {item.fecha_creacion}</Text>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 15 }}>Usuario: {item.usuario}</Text>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>Correo: {item.correo}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 20 }}>
                        <View style={{ paddingHorizontal: 10, width: '70%' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>Rol del usuario</Text>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, color: '#488aff' }}>{item.rol_usuario}</Text>
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

            <FlatList
                data={workers}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
            <Loading loading={loading} />
        </>
    )
}
export default Workers