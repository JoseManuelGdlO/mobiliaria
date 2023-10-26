import React, { useEffect } from 'react'
import { Dimensions, Modal, ScrollView, Text, View } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import DatePicker from 'react-native-date-picker'
import PrimaryButton from '@components/PrimaryButton'
const height = Dimensions.get('window').height

interface Props {
    open: boolean
    date: Date
    mode: "date" | "time" | "datetime"
    onChangePicker: (date: Date | null) => void
}

export const headerHeight = 56

const DatePickerComponent = ({
    open,
    mode,
    date,
    onChangePicker
}: Props): JSX.Element => {
    const [ dateState, setDateState ] = React.useState(date)

    const { fonts, colors } = useTheme()

    useEffect(() => {
    })


    return (
        <View> 
            <Modal visible={open} transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                <View style={{ backgroundColor: colors.black, borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
                    <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                        <DatePicker
                            date={date}
                            locale='es'
                            mode={mode}
                            onDateChange={(date) => {
                                setDateState(date)
                            }}
                        />
                    </ScrollView>
                    <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                        <PrimaryButton
                            containerStyle={{ width: '50%' }}
                            onPress={() => {
                                onChangePicker(dateState)
                            }}
                            title='Aceptar'
                        />
                        <PrimaryButton
                            containerStyle={{ width: '50%' }}
                            onPress={() => {
                                onChangePicker(null)
                            }}
                            backgroundButton='red'
                            title='Cancelar'
                        />
                    </View>
                    </View>
            </View>
        </Modal>
        </View>
    )
}

export default DatePickerComponent
