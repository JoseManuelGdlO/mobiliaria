import React, { useEffect } from 'react'
import { Dimensions, Modal, ScrollView, Text, View } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import PrimaryButton from '@components/PrimaryButton'
const height = Dimensions.get('window').height

interface Props {
    open: boolean
    title?: string
    notsure: () => void
    sure: () => void
}

export const headerHeight = 56

const AreYouSure = ({
    open,
    notsure,
    sure,
    title
}: Props): JSX.Element => {

    const { fonts, colors } = useTheme()

    useEffect(() => {
    })


    return (
        <View>
            <Modal visible={open} transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: colors.black, borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
                        <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                            <Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: colors.white, marginTop: 16, marginLeft: 16 }}>
                               Alerta
                            </Text>
                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.white, marginTop: 5, marginLeft: 16 }}>
                                { title ? title : 'Estas seguro que no quieres continuar ?'}
                            </Text>
                        </ScrollView>
                        <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                            <PrimaryButton
                                containerStyle={{ width: '50%' }}
                                onPress={() => {
                                    sure()
                                }}
                                title='Si'
                            />
                            <PrimaryButton
                                containerStyle={{ width: '50%' }}
                                onPress={() => {
                                    notsure()
                                }}
                                backgroundButton='red'
                                title='No'
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default AreYouSure