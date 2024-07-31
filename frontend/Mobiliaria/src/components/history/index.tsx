import { useTheme } from '@hooks/useTheme'
import { IHistorical } from '@interfaces/event-details'
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, Text, View } from 'react-native'
const height = Dimensions.get('window').height

interface Props {
    historial: IHistorical[]
}


const HistoryEvent = ({
    historial
}: Props): JSX.Element => {
    const { fonts } = useTheme()

    const renderItem = (item: any) => {
        console.log('item', item);
        
        let date = ''
        const dateArray = item.item.date ? item.item.date.split('T')[0].split('-') : []
        if(dateArray.length > 0)
            date = `${dateArray[2]}/${dateArray[1]}/${dateArray[0].slice(2, 4)}`
        
        return (
            <View style={{ display: 'flex', flexDirection: 'row',  minHeight: 30}}>
                <Text style={{ fontFamily: fonts.Inter.Regular, width: '20%' }}>{date}</Text>
                <Text style={{ fontFamily: fonts.Inter.Regular, width: '20%' }}>{item.item.nombre_comp}</Text>
                <Text style={{ fontFamily: fonts.Inter.Regular, width: '25%' }}>{item.item.description}</Text>
                <Text style={{ fontFamily: fonts.Inter.Regular, width: '35%', fontSize: 10 }}>{item.item.obs}</Text>
            </View>
        )
    }

    const keyExtractor = (item: any) => item.id


    return (
        <View> 
           
           <FlatList
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}></View>}
                    ListHeaderComponent={() => (
                        <View style={{ display: 'flex', flexDirection: 'row',  marginVertical: 5}}>
                            <Text style={{ width: '20%', fontWeight: 'bold', color: '#9E2EBE' }}>Fecha</Text>
                            <Text style={{ width: '20%', fontWeight: 'bold', color: '#9E2EBE' }}>Usuario</Text>
                            <Text style={{ width: '25%', fontWeight: 'bold', color: '#9E2EBE' }}>Descripcion</Text>
                            <Text style={{ width: '35%', fontWeight: 'bold', color: '#9E2EBE' }}>Observaciones</Text>
                        </View>
                    )}
                    data={historial}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                />
        </View>
    )
}

export default HistoryEvent
