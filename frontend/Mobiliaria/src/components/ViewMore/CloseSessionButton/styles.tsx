import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  container: ViewStyle
  title: TextStyle
}

const styles = (): StyleTypes => {
  const { fonts } = useTheme()
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16
    },
    title: {
      marginLeft: 18,
      fontFamily: fonts.Inter.Regular,
      fontSize: 16,
      color: '#9E2EBE'
    }
  })
}

export default styles
