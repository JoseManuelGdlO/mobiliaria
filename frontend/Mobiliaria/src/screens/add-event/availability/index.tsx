import { memo, useEffect } from "react"
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native"
import { IAvailability } from "@interfaces/availability"
import * as eventsService from '../../../services/events';
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
import { setInventaryRx, setTotalRx } from "@redux/actions/eventActions";
import Toast from "react-native-toast-message";
import { toast } from "@utils/alertToast";

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
    const [totalInventary, setTotalInventary] = React.useState<IAvailability[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [itemSelected, setItemSelected] = React.useState<IAvailability>({} as IAvailability)
    const [ inputvalue, setInputValue ] = React.useState<string>('')
    const [errorInput, setErrorInput] = React.useState<string>('')

    const { fonts, colors } = useTheme()

    const submitInv = () => {
        if (invSelected.length === 0) {
            toast('Error', 'no has seleccionado nada de inventario', 'error')
            return
        }
        console.log('id', id);
        if (id) {
            addItemsToEvent()
            return
        }
        dispatch(setInventaryRx(invSelected))
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
            const response = await eventsService.addItemsToEvent(Number(id), invSelected)
            console.log(response);
            navigation.goBack()
        } catch (error) {
            console.log(error);
        }
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
                                <Text key={inv.id_mob} style={{ fontSize: 10, color: colors.black, paddingHorizontal: 5, fontFamily: fonts.Roboto.Regular, borderRadius: 10, backgroundColor: color }}>
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
                    </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop:5 }}>
                    <View style={{ height: 25, width: '30%', backgroundColor: colors.black, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Regular }}>Subtotal
                            <Text style={{ fontSize: 12, fontFamily: fonts.Roboto.Bold, color: '#488aff', paddingLeft: 5 }}>
                                ${total}
                            </Text>
                        </Text>
                    </View>
                    <View style={{ height: 25, width: '30%', backgroundColor: colors.black, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
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
                    <View style={{ backgroundColor: colors.black, borderRadius: 10, margin: 20, maxHeight: height - 100 }}><Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: colors.white, marginTop: 16, marginLeft: 16 }}>
                        Selecciona cantidad
                    </Text>
                        <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5, marginLeft: 16 }}>
                            {itemSelected.nombre_mob} - ${itemSelected.costo_mob} - Cantidad.-{itemSelected.cantidad_mob}
                        </Text>
                        <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                            <TextInput
                                style={{ width: '100%', height: 40, paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1 }}
                                placeholder="Cantidad"
                                keyboardType="numeric"
                                autoFocus
                                onChangeText={(value: string) => {
                                    setErrorInput('')
                                    if (Number(value) > Number(itemSelected.cantidad_mob)) { 
                                        setErrorInput('No hay suficiente inventario')
                                        setInputValue(value)
                                        return
                                    }
                                    setInputValue(value)
                                    itemSelected.cantidad = Number(value)
                                    setItemSelected(itemSelected)
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
                                textStyle={{ fontSize: 12, color: colors.black }}
                                onPress={() => {
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
                                }}
                                disabled={errorInput.length !== 0}
                                title='Agregar'
                            />
                            <PrimaryButton
                                containerStyle={{ width: '50%', height: 30, paddingVertical: 1 }}
                                textStyle={{ fontSize: 12, color: colors.black}}
                                onPress={() => {
                                    itemSelected.cantidad = 0
                                    setItemSelected(itemSelected)
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