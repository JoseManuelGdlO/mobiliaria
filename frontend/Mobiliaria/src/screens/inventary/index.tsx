import { memo, useEffect } from "react"
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native"
import { IInventary } from "@interfaces/inventary"
import * as inventaryService from '../../services/inventary';
import Loading from "@components/loading";
import React from "react";
import { useTheme } from "@hooks/useTheme";
import SearchIcon from "@assets/images/icons/SearchIcon";

const Inventary = (): JSX.Element => {
    const [inventary, setInventary] = React.useState<IInventary[]>([])
    const [totalInventary, setTotalInventary] = React.useState<IInventary[]>([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const { fonts } = useTheme()

    const getInventary = async () => {
        try {
            const response = await inventaryService.getInventary() as IInventary[]
            setInventary(response)
            setTotalInventary(response)
        } catch (error) {
            console.log(error);
        } finally {
            setRefreshing(false);
            setLoading(false)
        }

    }

    useEffect(() => {
        console.log('useEffect');

        setLoading(true)
        getInventary()
    }, [])

    const keyExtractor = (item: (any), index: number): string => index.toString()

    const renderItem = ({
        item,
        index
    }: {
        item: IInventary
        index: number
    }): JSX.Element => {
        return (
            <TouchableOpacity>
                <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, alignItems: "center", alignContent: 'space-between' }}>
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

    return (
        <>
            <FlatList
                ListHeaderComponent={() => 
                    <View style={{ display: 'flex', flexDirection: 'row', borderBottomWidth: 1 }}>
                        <SearchIcon></SearchIcon>
                        <TextInput
                            style={{ width: '90%', paddingVertical: 0, paddingHorizontal: 10 }}
                            placeholder="Busqueda"
                            onChangeText={(value: string) => {
                                setSearch(value)
                                setInventary(totalInventary.filter((item: IInventary) => item.nombre_mob.includes(search)))

                            }}
                            value={search}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
                data={inventary}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                initialNumToRender={15}
            />
            <Loading loading={loading} />

        </>
    )
}
export default memo(Inventary)