import React, { useEffect } from 'react'
import { Dimensions, ScrollView, Text, View } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import DatePicker from 'react-native-date-picker'
import PrimaryButton from '@components/PrimaryButton'
import AppModal from '@components/AppModal'

interface Props {
  open: boolean
  date: Date
  mode: 'date' | 'time' | 'datetime'
  onChangePicker: (date: Date | null) => void
}

export const headerHeight = 56

const DatePickerComponent = ({
  open,
  mode,
  date,
  onChangePicker,
}: Props): JSX.Element => {
  const [dateState, setDateState] = React.useState(date)

  const { fonts, colors } = useTheme()

  useEffect(() => {
    setDateState(date)
  }, [date, open])

  const maxH = Dimensions.get('window').height - 120

  return (
    <View>
      <AppModal
        visible={open}
        onRequestClose={() => onChangePicker(null)}
        maxHeight={maxH}
        keyboardAvoiding
      >
        <View style={{ paddingHorizontal: 8, paddingTop: 16 }}>
          <Text
            style={{
              fontFamily: fonts.Inter.SemiBold,
              fontSize: 18,
              color: colors.Griss50,
              marginBottom: 8,
              paddingHorizontal: 12,
            }}
          >
            Seleccionar fecha
          </Text>
        </View>
        <ScrollView
          style={{ marginHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {open ? (
            <DatePicker
              date={dateState}
              locale="es"
              mode={mode}
              modal={false}
              theme="dark"
              onDateChange={(d) => {
                setDateState(d)
              }}
            />
          ) : null}
        </ScrollView>
        <View
          style={{
            margin: 16,
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: `${colors.Griss50}18`,
            paddingTop: 16,
          }}
        >
          <PrimaryButton
            containerStyle={{ width: '50%' }}
            onPress={() => {
              onChangePicker(dateState)
            }}
            title="Aceptar"
          />
          <PrimaryButton
            containerStyle={{ width: '50%' }}
            onPress={() => {
              onChangePicker(null)
            }}
            backgroundButton="red"
            title="Cancelar"
          />
        </View>
      </AppModal>
    </View>
  )
}

export default DatePickerComponent
