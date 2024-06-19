import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  container: ViewStyle
  containerIcon: ViewStyle
  title: TextStyle
  logoTalisis: ViewStyle
}

const styles = (headerHeight: number, backgroundColor: string | undefined, hideBackArrow: boolean): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    container: {
      height: headerHeight,
      backgroundColor: backgroundColor ?? '#000',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16
    },
    containerIcon: {
      height: headerHeight,
      backgroundColor: '#000',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'center',
      paddingHorizontal: 16
    },
    title: {
      height: 30,
      paddingLeft: 15,
      width: '80%',
      fontFamily: fonts.Inter.Bold,
      flexGrow: 1,
      fontSize: 20,
      color: '#FFF',
      alignSelf: 'center',
      textAlign: 'left',
      marginRight: (!hideBackArrow) ? 315 : 0,
    },
    logoTalisis: {
      flexGrow: 1,
      alignItems: 'center',
      marginRight: (!hideBackArrow) ? 25 : 0,
    }
  })
}

export default styles
