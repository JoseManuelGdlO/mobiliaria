import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  mainContainer: ViewStyle
  container: ViewStyle
  title: TextStyle
  line: ViewStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 32
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16
    },
    title: {
      marginLeft: 16,
      fontFamily: fonts.Inter.Regular,
      fontSize: 16,
      color: colors.white
    },
    line: {
      height: 1,
      backgroundColor: colors.Griss800,
      marginHorizontal: 16
    }
  })
}

export default styles
