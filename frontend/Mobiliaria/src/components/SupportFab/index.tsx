import React, { memo } from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'

import { NavigationScreens } from '@interfaces/navigation'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import _styles from './styles'
import Candado from '@assets/images/icons/Candado'
import LottieView from 'lottie-react-native'

export const FAB_WIDTH = 48

interface props {
  activeRouteName: string
}

const SupportFAB = ({ activeRouteName }: props): JSX.Element => {
  const animation = React.useRef(null);
  const styles = _styles()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()

  const goSupport = (): void => {
    navigation.navigate('Clients')
  }

  return (
    blackListSupportIconRoutes.includes(activeRouteName)
      ? <></>
      : (
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
        )
  )
}

export default memo(SupportFAB)

export const blackListSupportIconRoutes = [
  'Login'
]
