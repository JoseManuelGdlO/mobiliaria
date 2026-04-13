import Loading from "@components/loading"
import { IWorker } from "@interfaces/workers"
import React, { useEffect, useMemo, useRef } from "react"
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import AppModal from "@components/AppModal"
import * as workersService from '../../services/workers';
import LottieView from "lottie-react-native";
import { useTheme } from "@hooks/useTheme";
import PrimaryButton from "@components/PrimaryButton";
import AppCard from "@components/AppCard";
import EmptyState from "@components/EmptyState";
const height = Dimensions.get('window').height
import RNPickerSelect from 'react-native-picker-select';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { createAppPickerSelectStyle } from "@utils/pickerSelectTheme";
import ConfirmDialog from "@components/ConfirmDialog";

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

    const pickerSelectStyles = useMemo(() => createAppPickerSelectStyle(colors, fonts), [colors, fonts])
    const pickerCommon = useMemo(
        () => ({
            useNativeAndroidPickerStyle: false as const,
            darkTheme: true as const,
            style: pickerSelectStyles,
            doneText: 'Listo' as const,
        }),
        [pickerSelectStyles],
    )
    const PickerChevron = (): JSX.Element => (
        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.Morado100} />
    )

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
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <AppCard>
                    <View style={{ flexDirection: 'row' }}>
                        <LottieView
                            autoPlay
                            loop
                            style={{ width: 56, height: 56, backgroundColor: 'transparent' }}
                            source={require('../../assets/images/lottie/user.json')}
                        />
                        <View style={{ paddingLeft: 10, flex: 1 }}>
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}>{item.nombre_comp}</Text>
                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 4 }}>Alta {item.fecha_creacion}</Text>
                        </View>
                    </View>
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.Griss50}18` }}>
                        <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.Medium, fontSize: 14 }}>Usuario: {item.usuario}</Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 4 }}>Correo: {item.correo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                        <View style={{ flex: 1, minWidth: '45%', marginBottom: 8 }}>
                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 11, color: colors.gris400 }}>Rol</Text>
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.primario300 }}>{item.rol_usuario}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setWorkerNew(item)
                                setVisible(true)
                            }}
                            style={{ backgroundColor: colors.Morado600, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}
                        >
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.white }}>Detalles</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setWorkerNew(item)
                                setOpenAlert(2)
                            }}
                            style={{ backgroundColor: `${colors.red}33`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: `${colors.red}55` }}
                        >
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 12, color: colors.red }}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </AppCard>
            </View>

        )
    }

    const footerRender = () => {
        return(
            <>
                <View style={{ paddingHorizontal: 16 }}>
                    <PrimaryButton
                        containerStyle={{ width: '100%', paddingVertical: 8, marginBottom: 12 }}
                        textStyle={{ fontSize: 13, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                        backgroundButton={colors.Morado600}
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
        <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>

            <FlatList
                data={workers}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={footerRender}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
                ListEmptyComponent={!loading ? <EmptyState title="No hay trabajadores." subtitle="Agrega uno con el botón inferior." /> : null}
            />
            <Loading loading={loading} />
            <AppModal
                visible={visible}
                onRequestClose={() => setVisible(false)}
                keyboardAvoiding
                maxHeight={height - 100}
            >
                    <View>
                        <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 }}>
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 22, color: colors.Griss50, letterSpacing: 0.2 }}>
                                {workerNew.id_usuario === 0 ? 'Nuevo usuario' : 'Editar usuario'}
                            </Text>
                            <View
                                style={{
                                    alignSelf: 'flex-start',
                                    marginTop: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    backgroundColor: `${colors.Morado600}33`,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                }}
                            >
                                <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.Morado100 }}>
                                    {workerNew.correo === '' ? 'Completa los datos' : 'Modifica los datos del usuario'}
                                </Text>
                            </View>
                        </View>
                        <ScrollView
                            style={{ paddingHorizontal: 18 }}
                            contentContainerStyle={{ paddingBottom: 12 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 8 }}>
                                Nombre completo
                            </Text>
                            <TextInput
                                autoCapitalize="words"
                                placeholder="Nombre y apellido"
                                placeholderTextColor={colors.gris400}
                                value={workerNew.nombre_comp}
                                onChangeText={(value: string) => {
                                    setWorkerNew({
                                        ...workerNew,
                                        nombre_comp: value,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    backgroundColor: `${colors.Griss50}0C`,
                                    color: colors.Griss50,
                                    fontFamily: fonts.Inter.Regular,
                                    fontSize: 15,
                                }}
                            />
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                                Usuario
                            </Text>
                            <TextInput
                                autoCapitalize="none"
                                placeholder="Nombre de usuario"
                                placeholderTextColor={colors.gris400}
                                value={workerNew.usuario}
                                onChangeText={(value: string) => {
                                    setWorkerNew({
                                        ...workerNew,
                                        usuario: value,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    backgroundColor: `${colors.Griss50}0C`,
                                    color: colors.Griss50,
                                    fontFamily: fonts.Inter.Regular,
                                    fontSize: 15,
                                }}
                            />
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                                Correo electrónico
                            </Text>
                            <TextInput
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor={colors.gris400}
                                value={workerNew.correo}
                                onChangeText={(value: string) => {
                                    setWorkerNew({
                                        ...workerNew,
                                        correo: value,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    backgroundColor: `${colors.Griss50}0C`,
                                    color: colors.Griss50,
                                    fontFamily: fonts.Inter.Regular,
                                    fontSize: 15,
                                }}
                            />
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                                Tipo de usuario
                            </Text>
                            <View
                                style={{
                                    marginTop: 8,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    backgroundColor: `${colors.Griss50}0C`,
                                    paddingHorizontal: 4,
                                }}
                            >
                                <RNPickerSelect
                                    {...pickerCommon}
                                    Icon={PickerChevron}
                                    placeholder={{ label: 'Selecciona un tipo de usuario', value: null, color: colors.gris400 }}
                                    value={workerNew.rol_usuario || null}
                                    onValueChange={(value) => {
                                        setWorkerNew({
                                            ...workerNew,
                                            rol_usuario: value ?? '',
                                        })
                                    }}
                                    items={[
                                        { label: 'Administrador', value: 'Administrador' },
                                        { label: 'Repartidor', value: 'Repartidor' },
                                    ]}
                                />
                            </View>
                            <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 16 }}>
                                Contraseña
                            </Text>
                            <TextInput
                                secureTextEntry
                                autoCapitalize="none"
                                placeholder="••••••••"
                                placeholderTextColor={colors.gris400}
                                value={workerNew.contrasena}
                                onChangeText={(value: string) => {
                                    setWorkerNew({
                                        ...workerNew,
                                        contrasena: value,
                                    })
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: `${colors.Morado100}44`,
                                    backgroundColor: `${colors.Griss50}0C`,
                                    color: colors.Griss50,
                                    fontFamily: fonts.Inter.Regular,
                                    fontSize: 15,
                                }}
                            />
                        </ScrollView>
                        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 }}>
                            <PrimaryButton
                                containerStyle={{
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    minHeight: 50,
                                    marginBottom: 10,
                                }}
                                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                                backgroundButton={colors.Morado600}
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
                                title={workerNew.id_usuario === 0 ? 'Guardar usuario' : 'Guardar cambios'}
                            />
                            <PrimaryButton
                                containerStyle={{
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    minHeight: 50,
                                    marginBottom: workerNew.id_usuario !== 0 ? 10 : 0,
                                    borderWidth: 1.5,
                                    borderColor: `${colors.Morado100}66`,
                                    backgroundColor: 'transparent',
                                }}
                                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                                backgroundButton="transparent"
                                onPress={() => setVisible(false)}
                                title="Cancelar"
                            />
                            {workerNew.id_usuario !== 0 && (
                            <PrimaryButton
                                containerStyle={{
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    minHeight: 50,
                                }}
                                textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                                onPress={() => {
                                    setOpenAlert(1)
                                }}
                                backgroundButton={workerNew.active && workerNew.active === 1 ? colors.red : '#2e7d32'}
                                title={workerNew.active && workerNew.active === 1 ? 'Desactivar cuenta' : 'Activar cuenta'}
                            />)}
                        </View>
                    </View>
            </AppModal>
            <ConfirmDialog open={openAlert !== 0} sure={() => {

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
            ></ConfirmDialog>
            <Toast></Toast>
        </View>
    )
}
export default Workers