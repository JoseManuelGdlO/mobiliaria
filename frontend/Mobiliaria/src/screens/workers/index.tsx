import Loading from "@components/loading"
import { IWorker } from "@interfaces/workers"
import React, { useEffect, useRef } from "react"
import { Dimensions, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import * as workersService from '../../services/workers';
import LottieView from "lottie-react-native";
import { useTheme } from "@hooks/useTheme";
import PrimaryButton from "@components/PrimaryButton";
const height = Dimensions.get('window').height
import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import AreYouSure from "@components/are-you-suere-modal";

const Workers = (): JSX.Element => {
    const animation = useRef(null);
    const [workers, setWorkers] = React.useState<IWorker[]>([])
    const [loading, setLoading] = React.useState(false)
    const [ workerNew, setWorkerNew ] = React.useState<IWorker>({
        id_usuario: 0,
        nombre_comp: '',
        usuario: '',
        correo: '',
        rol_usuario: '',
        fecha_creacion: '',
        id_empresa: 0,
        contrasena: '',
        admin: 0,
        active: 0
    })
    const [ visible, setVisible ] = React.useState(false)
    const [ openAlert, setOpenAlert ] = React.useState(0)

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
                        <View style={{ paddingHorizontal: 10, width: '60%' }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12 }}>Rol del usuario</Text>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 12, color: '#488aff' }}>{item.rol_usuario}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setWorkerNew(item)
                                setVisible(true)
                            }}
                            style={{ backgroundColor: 'blue', borderRadius: 10, marginTop: 10, paddingHorizontal: 15, justifyContent: 'center', height: 20 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'white' }}>Detalles</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setWorkerNew(item)
                                setOpenAlert(2)
                            }}
                        style={{ marginLeft: 5, backgroundColor: 'red', borderRadius: 10, marginTop: 10, paddingHorizontal: 15, justifyContent: 'center', height: 20 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Medium, fontSize: 12, color: 'white' }}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        )
    }

    const footerRender = () => {
        return(
            <>
                <View style={{ paddingHorizontal: 10 }}>
                    <PrimaryButton
                        containerStyle={{ width: '100%', paddingVertical: 5, marginBottom: 5 }}
                        textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: colors.black }}
                        backgroundButton="#9E2EBE"
                        onPress={() => {
                            setVisible(true)
                        }}
                        title='Agregar usuario'
                    />
                </View>
            </>
        )
    }

    return (
        <>

            <FlatList
                data={workers}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={footerRender}
            />
            <Loading loading={loading} />
            <Modal visible={visible} transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: colors.black, borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
                        <Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: '#9E2EBE', marginTop: 16, marginLeft: 16 }}>
                            Usuario
                        </Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5, marginLeft: 16 }}>
                            {workerNew.correo === '' ? 'Agregar usuario' : 'Modificar usuario'}
                        </Text>
                        <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                            <View>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#9E2EBE', marginTop: 5 }}>
                                    Nombre completo
                                </Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={workerNew.nombre_comp}
                                    onChangeText={(value: string) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            nombre_comp: value
                                        })
                                    
                                    }}
                                    style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                />
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#9E2EBE', marginTop: 5 }}>
                                    Usuario
                                </Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={workerNew.usuario}
                                    onChangeText={(value: string) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            usuario: value
                                        })

                                    }}
                                    style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                />
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#9E2EBE', marginTop: 5 }}>
                                    Correo electronico
                                </Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={workerNew.correo}
                                    onChangeText={(value: string) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            correo: value
                                        })

                                    }}
                                    style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                />
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#9E2EBE', marginTop: 5 }}>
                                    Tipo de usuario
                                </Text>
                                <View style={{ borderBottomWidth: 1 }}>
                                <RNPickerSelect
                                    placeholder={{ label: 'Selecciona un tipo de usuario', value: null  }}
                                    value={workerNew.rol_usuario}
                                    onValueChange={(value) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            rol_usuario: value
                                        })
                                    
                                    }}
                                    items={[
                                        { label: 'Administrador', value: 'Administrador' },
                                        { label: 'Repartidor', value: 'Repartidor' },
                                    ]}
                                />

                                </View>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#9E2EBE', marginTop: 5 }}>
                                    Contrasena
                                </Text>
                                <TextInput
                                keyboardType="visible-password"
                                    autoCapitalize="none"
                                    value={workerNew.contrasena}
                                    onChangeText={(value: string) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            contrasena: value
                                        })

                                    }}
                                    style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                />
                            </View>

                        </ScrollView>
                        <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5, marginRight: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => {

                                    if (workerNew.id_usuario === 0) {
                                        if (workerNew.contrasena.length === 0 || workerNew.correo.length === 0 || workerNew.usuario.length === 0 || workerNew.rol_usuario.length === 0) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'Todos los campos son obligatorios',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                            return
                                        }

                                        const body = {
                                            name: workerNew.nombre_comp,
                                            pass: workerNew.contrasena,
                                            user: workerNew.usuario,
                                            userType: workerNew.rol_usuario,
                                            creation: new Date().toISOString().slice(0, 10),
                                            email: workerNew.correo,
                                            active: true,
                                        }

                                        try {

                                            workersService.addWorker(body)
                                            setWorkers([...workers, workerNew])
                                            setVisible(false)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Exito',
                                                text2: 'Se agrego correctamente',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                        } catch (error) {
                                            console.log(error);

                                        }
                                    } else {
                                        if (workerNew.contrasena.length === 0 || workerNew.correo.length === 0 || workerNew.usuario.length === 0 || workerNew.rol_usuario.length === 0) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'Todos los campos son obligatorios',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                            return
                                        }

                                        try {

                                            workersService.editWorker(workerNew)

                                            workers.find((item: IWorker, index: number) => {
                                                if (item.id_usuario === workerNew.id_usuario) {
                                                    workers[index] = workerNew
                                                }
                                            })

                                            setVisible(false)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Exito',
                                                text2: 'Se agrego correctamente',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => { }
                                            })
                                        } catch (error) {
                                            console.log(error);

                                        }

                                    }
                                    setWorkerNew({ id_usuario: 0, active: 0, nombre_comp: '', usuario: '', correo: '', rol_usuario: '', fecha_creacion: '', id_empresa: 0, contrasena: '', admin: 0  })

                                }}
                                title={workerNew.id_usuario === 0 ? 'Agregar' : 'Modificar'}
                            />
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5, marginRight: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => setVisible(false)}
                                backgroundButton='gray'
                                title='Cancelar'
                            />
                            {workerNew.id_usuario !== 0 && (
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => {
                                    setOpenAlert(1)
                                }}
                                backgroundButton={workerNew.active && workerNew.active === 1 ? 'red' : 'green'}
                                title={workerNew.active && workerNew.active === 1 ? 'Desactivar' : 'Activar'}
                            />)}
                        </View>
                    </View>
                </View>
            </Modal>
            <AreYouSure open={openAlert !== 0} sure={() => {

                if(openAlert === 1){
                    
                    workersService.active(workerNew.active && workerNew.active === 1 ? 0 : 1, workerNew.id_usuario)
                    workers.find((item: IWorker, index: number) => {
                        if (item.id_usuario === workerNew.id_usuario) {
                            workers[index].active = 0
                        }
                    })
                    setWorkerNew({ id_usuario: 0, active: 0, nombre_comp: '', usuario: '', correo: '', rol_usuario: '', fecha_creacion: '', id_empresa: 0, contrasena: '', admin: 0  })
                    setVisible(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Exito',
                        text2: 'Se desactivo correctamente',
                        visibilityTime: 3000,
                        autoHide: true,
                        onHide: () => { }
                    })
                }else if(openAlert === 2){
                    workersService.deleteWorker(workerNew.id_usuario)
                    
                    workers.find((item: IWorker, index: number) => {
                        
                        if (item && item.id_usuario === workerNew.id_usuario) {
                            workers.splice(index, 1)
                        }
                    })
                    setWorkerNew({ id_usuario: 0, active: 0, nombre_comp: '', usuario: '', correo: '', rol_usuario: '', fecha_creacion: '', id_empresa: 0, contrasena: '', admin: 0  })
                    setVisible(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Exito',
                        text2: 'Se elimino correctamente',
                        visibilityTime: 3000,
                        autoHide: true,
                        onHide: () => { }
                    })
                }

                setOpenAlert(0)
            }}
                notsure={() => {
                    setOpenAlert(0)
                }}
            ></AreYouSure>
            <Toast></Toast>
        </>
    )
}
export default Workers