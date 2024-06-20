import React, { memo, useState } from 'react'
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { NavigationScreens } from '@interfaces/navigation'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import _styles from './styles'
import LottieView from 'lottie-react-native'
import { useTheme } from '@hooks/useTheme'
import PrimaryButton from '@components/PrimaryButton'
import DatePicker from 'react-native-date-picker'
import CloseCircleLine from '@assets/images/icons/CloseCircleLine'

const height = Dimensions.get('window').height

export const FAB_WIDTH = 48

interface props {
  activeRouteName: string
}

const NewEventFab = ({ activeRouteName }: props): JSX.Element => {
  const [visible, setVisible] = React.useState(false)
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const animation = React.useRef(null);
  const styles = _styles()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()

  const { colors, fonts } = useTheme()

  const goSupport = (): void => {
    setVisible(true)
    setOpen(true)
  }


  const closeModal = (): void => {
    setVisible(false)
  }

  const goToAvailable = (): void => {
    navigation.navigate('Available', { date: date.toISOString() })
    setVisible(false)
  }

  return (
    blackListSupportIconRoutes.includes(activeRouteName)
      ? <></>
      : (
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
                // Find more Lottie files at https://lottiefiles.com/featured
                source={require('../../assets/images/lottie/add.json')}
              />
            </View>
          </TouchableOpacity>
          <Modal visible={visible} transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
              <View style={{ backgroundColor: '#FFF', borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
                <Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: '#FFF', marginTop: 16, marginLeft: 16 }}>
                  Crear nuevo evento
                </Text>
                <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#FFF', marginTop: 5, marginLeft: 16 }}>
                  selecciona el dia
                </Text>
                <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                  <DatePicker
                    open={open}
                    date={date}
                    locale='es'
                    mode='date'
                    onDateChange={(date) => {
                      console.log(date);
                      setDate(date)
                    }}
                  />
                </ScrollView>
                <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                  <PrimaryButton
                  containerStyle={{ width: '50%'}}
                    onPress={goToAvailable}
                    title='Aceptar'
                  />
                  <PrimaryButton
                    containerStyle={{ width: '50%' }}
                    onPress={closeModal}
                    backgroundButton='red'
                    title='Cancelar'
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )
  )
}

export default memo(NewEventFab)

export const blackListSupportIconRoutes = [
  'SignedOutStack',
  'SignedWorkerStack'
]
