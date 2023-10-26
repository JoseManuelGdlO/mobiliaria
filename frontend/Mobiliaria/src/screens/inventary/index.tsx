import { memo, useEffect } from "react"
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native"
import { IInventary } from "@interfaces/inventary"
import * as inventaryService from '../../services/inventary';
import Loading from "@components/loading";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import SearchIcon from "@assets/images/icons/SearchIcon";
import CancelIcon from "@assets/images/icons/CancelIcon";

const ITEMS_PEER_PAGE = 10

const Inventary = (): JSX.Element => {
    const [inventary, setInventary] = React.useState<IInventary[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IInventary[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [page, setPage] = React.useState<number>(1)

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

    const keyExtractor = (item: (any), index: number): string => item.id_mob.toString()+index

    const renderItem = ({
        item,
        index
    }: {
        item: IInventary
        index: number
    }): JSX.Element => {
        return (
            <TouchableOpacity>
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
                {search.length < 3 &&
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

        </>
    )
}
export default Inventary