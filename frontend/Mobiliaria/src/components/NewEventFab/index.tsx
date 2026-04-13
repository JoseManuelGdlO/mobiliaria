import React, { memo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { NavigationScreens } from '@interfaces/navigation'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import _styles from './styles'
import LottieView from 'lottie-react-native'
import { useTheme } from '@hooks/useTheme'
import PrimaryButton from '@components/PrimaryButton'
import DatePicker from 'react-native-date-picker'
import AppModal from '@components/AppModal'

export const FAB_WIDTH = 48

interface props {
  activeRouteName: string
}

const NewEventFab = ({ activeRouteName }: props): JSX.Element => {
  const [visible, setVisible] = React.useState(false)
  const [date, setDate] = useState(new Date())
  const animation = React.useRef(null)
  const styles = _styles()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()

  const { colors, fonts } = useTheme()

  const goSupport = (): void => {
    setVisible(true)
  }

  const closeModal = (): void => {
    setVisible(false)
  }

  const goToAvailable = (): void => {
    navigation.navigate('Available', { date: date.toISOString() })
    setVisible(false)
  }

  return blackListSupportIconRoutes.includes(activeRouteName) ? (
    <></>
  ) : (
    <View>
      <TouchableOpacity style={styles.rootStyles} onPress={goSupport}>
        <View style={styles.fabButtonStyles}>
          <LottieView
            ref={animation}
            autoPlay
            loop={true}
            style={{
              width: 80,
              height: 80,
              backgroundColor: 'transparent',
            }}
            source={require('../../assets/images/lottie/add.json')}
          />
        </View>
      </TouchableOpacity>
      <AppModal
        visible={visible}
        onRequestClose={closeModal}
        maxHeight={undefined}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text
            style={{
              fontFamily: fonts.Inter.SemiBold,
              fontSize: 18,
              color: colors.Griss50,
            }}
          >
            Crear nuevo evento
          </Text>
          <Text
            style={{
              fontFamily: fonts.Inter.Regular,
              fontSize: 14,
              color: colors.gris300,
              marginTop: 6,
            }}
          >
            Selecciona el día
          </Text>
        </View>
        <ScrollView
          style={{ marginHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {visible ? (
            <DatePicker
              date={date}
              locale="es"
              mode="date"
              modal={false}
              theme="dark"
              onDateChange={(d) => {
                setDate(d)
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
            onPress={goToAvailable}
            title="Aceptar"
          />
          <PrimaryButton
            containerStyle={{ width: '50%' }}
            onPress={closeModal}
            backgroundButton="red"
            title="Cancelar"
          />
        </View>
      </AppModal>
    </View>
  )
}

export default memo(NewEventFab)

export const blackListSupportIconRoutes = ['SignedOutStack', 'SignedWorkerStack']
