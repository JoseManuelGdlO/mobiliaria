import { memo, useEffect } from "react"
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { IInventary } from "@interfaces/inventary"
import * as inventaryService from '../../services/inventary';
import Loading from "@components/loading";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import SearchIcon from "@assets/images/icons/SearchIcon";
import CancelIcon from "@assets/images/icons/CancelIcon";
import PrimaryButton from "@components/PrimaryButton";
import Toast from "react-native-toast-message";
import AreYouSure from "@components/are-you-suere-modal";
const height = Dimensions.get('window').height

const ITEMS_PEER_PAGE = 10

const Inventary = (): JSX.Element => {
    const [inventary, setInventary] = React.useState<IInventary[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IInventary[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)
    const [visible, setVisible] = React.useState(false)
    const [ inventaryNew, setInventaryNew ] = React.useState<IInventary>({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
    const [ nombre, setNombre ] = React.useState<string>('')
    const [ cantidad, setCantidad ] = React.useState<string>('')
    const [ costo, setCosto ] = React.useState<string>('')
    const [ openAlert, setOpenAlert ] = React.useState(false)

    const { fonts, colors } = useTheme()

    const addData = () => {
        if (search.length > 2) {
            return
        }
        let inv: IInventary[] = []
        if (page === 1) {
            inv = totalInventary.slice(0, page * ITEMS_PEER_PAGE)
        } else {
            inv = totalInventary.slice(page * ITEMS_PEER_PAGE, page * ITEMS_PEER_PAGE + ITEMS_PEER_PAGE)
        }

        inv = [...inventary, ...inv]
        setInventary(inv)
        setPage(page + 1)
    }


    const getInventary = async () => {
        try {
            const response = await inventaryService.getInventary() as IInventary[]

            await setTotalInventary(response)
            const inv = response.slice(0, page * ITEMS_PEER_PAGE)
            setInventary(inv)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
            setLoading(false)
        }

    }

    useEffect(() => {
        setLoading(true)
        getInventary()
    }, [])

    const keyExtractor = (item: (any), index: number): string => item.id_mob.toString() + index

    const renderItem = ({
        item,
        index
    }: {
        item: IInventary
        index: number
    }): JSX.Element => {
        return (
            <TouchableOpacity onPress={() => {
                setInventaryNew(item)
                setNombre(item.nombre_mob)
                setCantidad(item.cantidad_mob.toString())
                setCosto(item.costo_mob.toString())
                setVisible(true)
            }}>
                <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 26, paddingVertical: 10, alignItems: "center", alignContent: 'space-between' }}>
                    <View style={{ width: '85%' }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>
                            {item.nombre_mob}
                        </Text>
                        <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 10 }}>
                            {item.cantidad_mob} Pieza{item.cantidad_mob > 1 ? 's' : ''}
                        </Text>
                        <Text style={{ fontFamily: fonts.Roboto.BoldItalic, fontSize: 10 }}>
                            ${item.costo_mob} c/u
                        </Text>

                    </View>
                    <Text>
                        detalles
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderFooter = () => {
        return (
            <>
                <View style={{ paddingHorizontal: 10 }}>
                    <PrimaryButton
                        containerStyle={{ width: '100%', paddingVertical: 5, marginBottom: 5 }}
                        textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: colors.black }}
                        backgroundButton="#9E2EBE"
                        onPress={() => {
                            setVisible(true)
                        }}
                        title='Agregar inventario'
                    />
                </View>
                {search.length < 3 && inventary.length > 10 &&
                    <View style={{ height: 30 }}>
                        <ActivityIndicator></ActivityIndicator>
                    </View>
                }
            </>
        )
    }

    return (
        <>

            <FlatList
                ListHeaderComponent={
                    <View style={{ display: 'flex', flexDirection: 'row', padding: 16, backgroundColor: colors.black }}>
                        <View style={{ paddingTop: 10 }}>
                            <SearchIcon></SearchIcon>
                        </View>
                        <TextInput
                            style={{ width: '85%', height: 40, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1 }}
                            placeholder="Busqueda"
                            onChangeText={(value: string) => {
                                setSearch(value)
                                if (value === '') {
                                    setPage(1)
                                    setInventary(totalInventary.slice(0, page * ITEMS_PEER_PAGE))
                                }
                                else if (value.length > 2) {

                                    setPage(1)
                                    const total = totalInventary.filter((item: IInventary) => item.nombre_mob.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
                                    setInventary(total)
                                }

                            }}
                            value={search}
                        />
                        <TouchableOpacity onPress={() => {
                            setSearch('')
                            setInventary(totalInventary)
                            setPage(1)
                            setInventary(totalInventary.slice(0, page * ITEMS_PEER_PAGE))
                        }} style={{ paddingTop: 10, borderBottomWidth: 1 }}>
                            <CancelIcon></CancelIcon>
                        </TouchableOpacity>
                    </View>
                }
                stickyHeaderIndices={[0]}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                data={inventary}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={renderFooter}
                onEndReachedThreshold={0.3}
                onEndReached={addData}
            />
            <Loading loading={loading} />
            <Modal visible={visible} transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: colors.black, borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
                        <Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: colors.white, marginTop: 16, marginLeft: 16 }}>
                            Inventario
                        </Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5, marginLeft: 16 }}>
                            {inventaryNew.nombre_mob === '' ? 'Agregar' : 'Modificar'}
                        </Text>
                        <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                            <View>
                                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5 }}>
                                    Nombre
                                </Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={nombre}
                                    onChangeText={setNombre}
                                    style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 20 }}>
                                <View style={{ width: '50%', paddingRight: 10 }}>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5 }}>
                                        Cantidad
                                    </Text>
                                    <TextInput
                                        value={cantidad}
                                        onChangeText={(value: string) => setCantidad(value)}
                                        keyboardType="number-pad"
                                        autoCapitalize="none"
                                        style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                    />
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5 }}>
                                        Precio
                                    </Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={costo}
                                        onChangeText={(value: string) => setCosto(value)}
                                        autoCapitalize="none"
                                        style={{ width: '100%', height: 30, paddingVertical: 0, paddingHorizontal: 10, borderBottomWidth: 1, color: colors.white }}
                                    />
                                </View>

                            </View>
                          
                        </ScrollView>
                        <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5, marginRight: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => {

                                    if(inventaryNew.nombre_mob === ''){
                                        if(nombre.length === 0 || cantidad.length === 0 || costo.length === 0){
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'Todos los campos son obligatorios',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => {}
                                            })
                                            return
                                        }
                                        
                                        const body = {
                                            name: nombre,
                                            quantity: parseInt(cantidad),
                                            price: costo
                                        }

                                        try {
                                            
                                            inventaryService.addInventary(body)
                                            const last = totalInventary[totalInventary.length-1].id_mob
                                            const inv: IInventary = { id_mob: last ? last + 1 : 9999, nombre_mob: body.name, cantidad_mob: body.quantity, costo_mob: parseInt(body.price) }
                                            setTotalInventary([...totalInventary, inv])
                                            setInventary([...inventary, inv])
                                            setVisible(false)
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Exito',
                                                text2: 'Se agrego correctamente',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => {}
                                            })
                                        } catch (error) {
                                         console.log(error);
                                            
                                        }
                                    } else {
                                        if((nombre.length === 0 && inventaryNew.nombre_mob === nombre) || (cantidad.length === 0 && inventaryNew.cantidad_mob === parseInt(cantidad)) || (costo.length === 0 && inventaryNew.costo_mob === parseInt(costo))){
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Error',
                                                text2: 'No se puede modificar el mismo elemento',
                                                visibilityTime: 3000,
                                                autoHide: true,
                                                onHide: () => {}
                                            })
                                            return
                                        }
                                        const body = {
                                            id: inventaryNew.id_mob,
                                            name: nombre,
                                            quantity: parseInt(cantidad),
                                            price: costo
                                        }

                                        try {

                                            inventaryService.updateInventary(body)
                                            inventaryNew.nombre_mob = body.name
                                            inventaryNew.cantidad_mob = body.quantity
                                            inventaryNew.costo_mob = parseInt(body.price)
                                            
                                            inventary.find((item: IInventary, index: number) => {
                                                if(item.id_mob === inventaryNew.id_mob){
                                                    inventary[index] = inventaryNew
                                                }
                                            })

                                            totalInventary.find((item: IInventary, index: number) => {
                                                if(item.id_mob === inventaryNew.id_mob){
                                                    totalInventary[index] = inventaryNew
                                                }
                                            })

                                            setInventaryNew({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
                                            
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
                                    setNombre('')
                                    setCantidad('')
                                    setCosto('')
                                    
                                }}
                                title={inventaryNew.nombre_mob === '' ? 'Agregar' : 'Modificar'}
                            />
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5, marginRight: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => setVisible(false)}
                                backgroundButton='gray'
                                title='Cancelar'
                            />
                            <PrimaryButton
                                containerStyle={{ width: '33%', paddingVertical: 5, borderRadius: 5 }}
                                textStyle={{ fontSize: 12, fontFamily: fonts.Roboto.Regular, color: 'white' }}
                                onPress={() => setOpenAlert(true)}
                                backgroundButton='red'
                                title='Eliminar'
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <AreYouSure open={openAlert} sure={() => {

                try {
                    inventaryService.remove(inventaryNew.id_mob? inventaryNew.id_mob : 0)
                    const inv = totalInventary.filter((item: IInventary) => item.id_mob !== inventaryNew.id_mob)
                    setTotalInventary(inv)
                    setInventary(inv.slice(0, page * ITEMS_PEER_PAGE))
                    setSearch('')
                    setVisible(false)
                    setOpenAlert(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Exito',
                        text2: 'Se elimino correctamente',
                        visibilityTime: 3000,
                        autoHide: true,
                        onHide: () => { }
                    })
                } catch (error) {
                    console.log(error);
                }
                setInventaryNew({ nombre_mob: '', cantidad_mob: 0, costo_mob: 0 })
                setOpenAlert(false)
                setVisible(false)
            }}
                notsure={() => {
                    setOpenAlert(false)
                }}
            ></AreYouSure>
        </>
    )
}
export default Inventary