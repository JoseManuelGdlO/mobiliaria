import { memo, useEffect } from "react"
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native"
import { IAvailability } from "@interfaces/availability"
import * as eventsService from '../../../services/events';
import * as packageService from '../../../services/package';
import Loading from "@components/loading";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import SearchIcon from "@assets/images/icons/SearchIcon";
import CancelIcon from "@assets/images/icons/CancelIcon";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { NavigationScreens } from "@interfaces/navigation";
import PrimaryButton from "@components/PrimaryButton";
import { generateRandomColor } from "@utils/colors";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setInventaryRx, setPackagesRx, setTotalRx } from "@redux/actions/eventActions";
import Toast from "react-native-toast-message";
import { toast } from "@utils/alertToast";
import { IPackage } from "@interfaces/packages";
import { ScrollView } from "react-native-gesture-handler";

const ITEMS_PEER_PAGE = 20
const height = Dimensions.get('window').height

const Availability = ({
    route
}: StackScreenProps<NavigationScreens, 'Available'>): JSX.Element => {
    let date = route.params.date
    if (date.includes('T')) {
        date = date.split('T')[0]
    }
    let id = route.params.id

    const dispatch = useDispatch()

    const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
    const [inventary, setInventary] = React.useState<IAvailability[]>([])
    const [total, setTotal] = React.useState<number>(0)
    const [invSelected, setInvSelected] = React.useState<IAvailability[]>([])
    const [pktSelected, setPktSelected] = React.useState<IPackage[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IAvailability[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [itemSelected, setItemSelected] = React.useState<IAvailability>({} as IAvailability)
    const [itemPackageSelected, setItemPackageSelected] = React.useState<IPackage>({} as IPackage)
    const [ inputvalue, setInputValue ] = React.useState<string>('')
    const [errorInput, setErrorInput] = React.useState<string>('')
    const [packages, setPackages] = React.useState<IPackage[]>([])

    const { fonts, colors } = useTheme()

    const submitInv = () => {
        if (invSelected.length === 0 && pktSelected.length === 0) {
            toast('Error', 'no has seleccionado nada de inventario', 'error')
            return
        }
        if (id) {
            addItemsToEvent()
            return
        }
        
        dispatch(setInventaryRx(invSelected))
        dispatch(setPackagesRx(pktSelected))
        dispatch(setTotalRx(total))
        navigation.navigate('AddEvent', { date })

    }

    const addData = () => {
        if (search.length > 2) {
            return
        }
        let inv: IAvailability[] = []
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
            const response = await eventsService.getAvailableDay(date)

            await setTotalInventary(response.inventary)
            setPackages(response.packages)
            const inv = response.inventary.slice(0, page * ITEMS_PEER_PAGE)
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
        item: IAvailability
        index: number
    }): JSX.Element => {
        return (
            <TouchableOpacity onPress={() => {
                setItemSelected(item)
                setModalVisible(true)
            }}
                style={{ padding: 5 }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: colors.gray400,
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    paddingHorizontal: 26,
                    paddingVertical: 10,
                    alignItems: "center",
                    alignContent: 'space-between'
                }}>
                    <View style={{ width: '85%' }}>
                        <Text style={{ color: '#9E2EBE', fontFamily: fonts.Roboto.Medium, fontSize: 12 }}>
                            {item.nombre_mob}
                        </Text>
                        <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 10 }}>
                            {Number(item.cantidad_mob)} Pieza{Number(item.cantidad_mob) > 1 ? 's' : ''}
                        </Text>

                    </View>
                    <View>

                        <Text style={{ fontFamily: fonts.Roboto.BoldItalic, fontSize: 10 }}>
                            ${item.costo_mob} c/u
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderFooter = () => {
        return (
            <>
                {search.length < 3 &&
                    <View style={{ height: 30 }}>
                        <ActivityIndicator></ActivityIndicator>
                    </View>
                }
            </>
        )
    }

    const addItemsToEvent = async () => {
        try {
            setLoading(true)
            await eventsService.addItemsToEvent(Number(id), invSelected)
            navigation.navigate('EventDetail', { id: Number(id) })
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }

    return (
        <>

            <FlatList
                ListHeaderComponent={
                    <View>
                        <View style={{ display: 'flex', flexDirection: 'row', padding: 16, backgroundColor: '#FFF' }}>
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
                                        const total = totalInventary.filter((item: IAvailability) => item.nombre_mob.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
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
                        { packages.length !== 0 && <View>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 15, color: '#000', paddingHorizontal: 10 }}>
                                Paquetes
                            </Text>
                            <ScrollView style={{maxHeight: 150, overflow: "scroll"}}>
                                
                                {packages.map(pack => {
                                    return (
                                        <TouchableOpacity onPress={() => {                                            
                                            setItemPackageSelected(pack)
                                            setModalVisible(true)
                                        }}
                                        style={{ backgroundColor: '#FFF', borderRadius: 5, marginHorizontal: 5 }}>
                                            <View style={{
                                                borderWidth: 1,
                                                borderColor: colors.gray400,
                                                borderRadius: 10,
                                                paddingHorizontal: 26,
                                                paddingTop: 10,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                display: 'flex',
                                                alignItems: "center",
                                                marginTop: 5
                                            }}>
                                                <View style={{ width: '85%' }}>
                                                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 14, color: '#9E2EBE' }}>
                                                        {pack.nombre} 
                                                    </Text>
                                                    <Text style={{ fontFamily: fonts.Roboto.Regular, fontSize: 10, color: '#488aff' }}>
                                                        Disponible.- {pack.availiable} {"\n"}
                                                        {pack.products.map(prod => {                                                    
                                                            return (
                                                                <Text style={{ fontFamily: fonts.Roboto.MediumItalic, fontSize: 10, color: colors.gray400, paddingTop: 2 }}>
                                                                    {prod.nombre_mob} - {prod.cantidad} Piezas {"\n"}
                                                                </Text>
                                                            )
                                                        })}
                                                    </Text>
                                                </View>
                                                <View style={{ width: '15%' }}>
                                                    <Text style={{ fontFamily: fonts.Roboto.BoldItalic, fontSize: 10 }}>
                                                        ${pack.precio} c/u
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                            <View style={{width: '100%', height: 1, backgroundColor: '#FFF', marginTop: 10}}></View>
                        </View>}
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
            <View style={{ width: '100%', position: 'absolute', bottom: 0, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.gray400 }}>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text>
                        {invSelected.map(inv => {
                            const color = generateRandomColor()
                            return (
                                <Text key={inv.id_mob} style={{ fontSize: 10, color: '#FFF', paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular, borderRadius: 10, backgroundColor: color }}>
                                    {inv.nombre_mob} - {inv.cantidad}
                                    <TouchableOpacity onPress={() => {
                                        setTotal(total - (inv.costo_mob * Number(inv.cantidad)))
                                        setInvSelected(invSelected.filter(item => item.id_mob !== inv.id_mob))
                                    
                                    }} style={{ backgroundColor: color, position: 'absolute', marginLeft: -12 }}>
                                        <CancelIcon size={10}></CancelIcon>
                                    </TouchableOpacity>
                                </Text>

                            )
                        })}
                        {pktSelected.map(inv => {
                            const color = generateRandomColor()
                            return (
                                <Text key={inv.id} style={{ fontSize: 10, color: '#FFF', paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular, borderRadius: 10, backgroundColor: color }}>
                                    {inv.nombre} - {inv.cantidad}
                                    <TouchableOpacity onPress={() => {

                                        for(let pkt of inv.products) {
                                            const item = totalInventary.find(inv => inv.id_mob === pkt.fkid_inventario)
                                            if(item) {
                                                const cantidad = Number(item.cantidad_mob) + Number(pkt.cantidad) * Number(inv.cantidad)
                                                item.cantidad_mob = String(cantidad)
                                            }
                                            const itemInv = inventary.find(inv => inv.id_mob === pkt.id_mob) 
                                            if(itemInv) {
                                                const cantidad = Number(itemInv.cantidad_mob) + Number(pkt.cantidad) * Number(inv.cantidad)
                                                itemInv.cantidad_mob = String(cantidad)
                                            }
                                        }
                                        setTotal(total - (inv.precio * Number(inv.cantidad)))
                                        setPktSelected(pktSelected.filter(item => item.id !== inv.id))
                                    
                                    }} style={{ backgroundColor: color, position: 'absolute', marginLeft: -12 }}>
                                        <CancelIcon size={10}></CancelIcon>
                                    </TouchableOpacity>
                                </Text>

                            )
                        })}
                    </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop:5 }}>
                    <View style={{ height: 25, width: '30%', backgroundColor: '#FFF', marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Regular }}>Subtotal
                            <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingLeft: 5 }}>
                                ${total}
                            </Text>
                        </Text>
                    </View>
                    <View style={{ height: 25, width: '30%', backgroundColor: '#FFF', marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Bold, color: '#488aff' }}>+ IVA {total + (total * .16)}</Text>
                    </View>
                </View>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={submitInv} style={{ height: 40, width: '80%', backgroundColor: '#488aff', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Continuar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.goBack()
                    }}
                    style={{ height: 40, width: '20%', backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
                        <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Cancelar</Text>
                    </TouchableOpacity>

                </View>
            </View>
            <Loading loading={loading} />
            <Toast />
            <Modal visible={modalVisible} transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#FFF', borderRadius: 10, margin: 20, maxHeight: height - 100 }}><Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: '#fff', marginTop: 16, marginLeft: 16 }}>
                        Selecciona cantidad
                    </Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#000', marginTop: 5, marginLeft: 16 }}>
                            {itemSelected.nombre_mob ? itemSelected.nombre_mob : itemPackageSelected.nombre } - ${itemSelected.costo_mob ? itemSelected.costo_mob : itemPackageSelected.precio} - Cantidad.-{itemSelected.cantidad_mob ? itemSelected.cantidad_mob : itemPackageSelected.availiable}
                        </Text>
                        <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                            <TextInput
                                style={{ width: '100%', height: 40, paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1 }}
                                placeholder="Cantidad"
                                keyboardType="numeric"
                                autoFocus
                                onChangeText={(value: string) => {
                                    setErrorInput('')
                                    
                                    if(itemSelected.nombre_mob) {
                                        if (Number(value) > Number(itemSelected.cantidad_mob)) { 
                                            setErrorInput('No hay suficiente inventario')
                                            setInputValue(value)
                                            return
                                        }
                                        setInputValue(value)
                                        itemSelected.cantidad = Number(value)
                                        setItemSelected(itemSelected)

                                    } else {
                                        
                                        if (itemPackageSelected.availiable === 0 || Number(value) > Number(itemPackageSelected.availiable)) { 
                                            setErrorInput('No hay suficiente inventario')
                                            setInputValue(value)
                                            return
                                        }
                                        setInputValue(value)
                                        itemPackageSelected.cantidad = Number(value)
                                        setItemPackageSelected(itemPackageSelected)
                                    }
                                }}
                                value={inputvalue}
                            />
                            { errorInput.length !== 0 && (
                                <Text style={{ fontFamily: fonts.Inter.Bold, fontSize: 10, color: 'red', marginTop: 2, marginLeft: 16 }}>
                                    {errorInput}
                                </Text>
                            )}
                        </View>
                        <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                            <PrimaryButton
                                containerStyle={{ width: '50%', height: 30, paddingVertical: 1 }}
                                textStyle={{ fontSize: 12, color: '#FFF' }}
                                onPress={() => {
                                    console.log('packages', itemPackageSelected);
                                    
                                        console.log('itemSelected', itemSelected);
                                    if(itemSelected.nombre_mob) {
                                        
                                        let exist = false
                                        let localtotal = 0
                                        for (const inv of invSelected) {
                                            if (inv.id_mob === itemSelected.id_mob) {
                                                inv.cantidad = itemSelected.cantidad
                                                setInvSelected(invSelected)
                                                setModalVisible(false)
                                                exist = true
                                                setInputValue('')
                                            }
                                            localtotal += inv.costo_mob * Number(inv.cantidad)

                                        }

                                        if(exist) {
                                            setTotal(localtotal)
                                            return
                                        }
                                        
                                        setInvSelected([...invSelected, itemSelected])
                                        const cantidad = Number(itemSelected.cantidad)
                                        setTotal(total + itemSelected.costo_mob * cantidad)
                                        setInputValue('')
                                        setModalVisible(false)
                                    } else {
                                        const oldQnty = itemPackageSelected.cantidad? itemPackageSelected.cantidad : 0
                                        let exist = false
                                        let localtotal = 0
                                        for (const pkt of pktSelected) {
                                            if (pkt.id === itemPackageSelected.id) {
                                                pkt.cantidad = itemPackageSelected.cantidad
                                                setPktSelected(pktSelected)
                                                setModalVisible(false)
                                                exist = true
                                                setInputValue('')
                                            }
                                            localtotal += pkt.precio * Number(pkt.cantidad)

                                        }

                                        if(exist) {

                                            for(let pkt of itemPackageSelected.products) {
                                                
                                                const pktQuantity = itemPackageSelected?.cantidad ? itemPackageSelected.cantidad  : 0
                                                const item = totalInventary.find(inv => inv.id_mob === pkt.fkid_inventario)
                                                
                                                const toRemove = pkt?.cantidad? pkt.cantidad * oldQnty  : 0
                                                
                                                const qtyPkt = pkt?.cantidad? pkt.cantidad * pktQuantity  : 0
                                                if(item) {
                                                    item.cantidad_mob = String(toRemove)
                                                    const cantidad = Number(item.cantidad_mob) - qtyPkt
                                                    item.cantidad_mob = String(cantidad)
                                                }
                                                
                                                const itemInv = inventary.find(inv => inv.id_mob === pkt.id_mob) 
                                                if(itemInv) {
                                                    itemInv.cantidad_mob = String(toRemove)
                                                    const cantidad = Number(itemInv.cantidad_mob) - qtyPkt
                                                    itemInv.cantidad_mob = String(cantidad)
                                                }
                                                
                                            }

                                            setTotal(localtotal)
                                            return
                                        }

                                        for(let pkt of itemPackageSelected.products) {
                                            const pktQuantity = itemPackageSelected?.cantidad ? itemPackageSelected.cantidad  : 0
                                            const item = totalInventary.find(inv => inv.id_mob === pkt.fkid_inventario)
                                            
                                            const qtyPkt = pkt?.cantidad? pkt.cantidad * pktQuantity  : 0 
                                            if(item) {
                                                const cantidad = Number(item.cantidad_mob) - qtyPkt
                                                item.cantidad_mob = String(cantidad)
                                            }
                                            
                                            const itemInv = inventary.find(inv => inv.id_mob === pkt.id_mob) 
                                            if(itemInv) {
                                                const cantidad = Number(itemInv.cantidad_mob) - qtyPkt
                                                itemInv.cantidad_mob = String(cantidad)
                                            }
                                            
                                        }
                                        
                                        setPktSelected([...pktSelected, itemPackageSelected])
                                        const cantidad = Number(itemPackageSelected.cantidad)
                                        setTotal(total + itemPackageSelected.precio * cantidad)
                                        setInputValue('')
                                        setModalVisible(false)

                                    }
                                    const aval = { cantidad: 0 } as IAvailability
                                    setItemSelected(aval)
                                    setInputValue('')
                                    setModalVisible(false)
                                    
                                    const pkt = { cantidad: 0 } as IPackage
                                    setItemPackageSelected(pkt)
                                    setInputValue('')
                                    setModalVisible(false)
                                    
                                }}
                                disabled={errorInput.length !== 0}
                                title='Agregar'
                            />
                            <PrimaryButton
                                containerStyle={{ width: '50%', height: 30, paddingVertical: 1 }}
                                textStyle={{ fontSize: 12, color: '#FFF'}}
                                onPress={() => {
                                    const aval = { cantidad: 0 } as IAvailability
                                    setItemSelected(aval)
                                    setInputValue('')
                                    setModalVisible(false)
                                    
                                    const pkt = { cantidad: 0 } as IPackage
                                    setItemPackageSelected(pkt)
                                    setInputValue('')
                                    setModalVisible(false)
                                }}
                                backgroundButton={colors.gray400}
                                title='Cancelar'
                            />
                        </View>
                    </View>
                </View>
            </Modal>

        </>
    )
}
export default Availability