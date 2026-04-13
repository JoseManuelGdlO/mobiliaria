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
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 12,
      flex: 1,
    },
    title: {
      marginLeft: 14,
      fontFamily: fonts.Inter.Medium,
      fontSize: 16,
      color: colors.Griss50,
      flex: 1,
    },
    line: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: `${colors.Griss50}18`,
      marginHorizontal: 16,
    },
  })
}

export default styles
