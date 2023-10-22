import { StyleSheet, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import { FAB_WIDTH } from '.'
import { hasNotch } from 'react-native-device-info'

interface StyleTypes {
  rootStyles: ViewStyle
  fabButtonStyles: ViewStyle
}

const styles = (): StyleTypes => {
  const { colors } = useTheme()
  return StyleSheet.create({
    rootStyles: {
      borderRadius: FAB_WIDTH,
      position: 'absolute',
      bottom: hasNotch() ? 96 : 80, // footer menu height
      right: 16
    },
    fabButtonStyles: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      width: FAB_WIDTH,
      height: FAB_WIDTH,
      borderRadius: FAB_WIDTH
    }
  })
}

export default styles
