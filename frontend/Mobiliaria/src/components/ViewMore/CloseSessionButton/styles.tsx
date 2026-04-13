import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  container: ViewStyle
  title: TextStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${colors.red}55`,
      backgroundColor: `${colors.red}14`,
    },
    title: {
      fontFamily: fonts.Inter.SemiBold,
      fontSize: 15,
      color: colors.red,
    },
  })
}

export default styles
