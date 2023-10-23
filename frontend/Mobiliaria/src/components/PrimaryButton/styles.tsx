import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  container: ViewStyle
  title: TextStyle
  titleDisabled: TextStyle
  row: ViewStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    container: {
      paddingVertical: 16,
      backgroundColor: colors.ElectricBlue300,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    title: {
      fontSize: 16,
      color: colors.black,
      textAlign: 'center',
      fontFamily: fonts.Inter.Bold,
      fontWeight: 'bold'
    },
    titleDisabled: {
      fontSize: 16,
      color: colors.darkBlack200,
      textAlign: 'center',
      fontFamily: fonts.Inter.Bold,
      fontWeight: 'bold'
    },
    row: {
      flexDirection: 'row'
    }
  })
}

export default styles
