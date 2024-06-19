import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  rippleContainer: ViewStyle
  container: ViewStyle
  title: TextStyle
  titleContainer: ViewStyle
  infoContainer: ViewStyle
  rowContainer: ViewStyle
  description: TextStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    rippleContainer: {
      marginBottom: 8,
      borderRadius: 8
    },
    container: {
      borderRadius: 8,
      backgroundColor: '#fff',
      overflow: 'hidden'
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.15)'
    },
    title: {
      marginLeft: 8,
      fontFamily: fonts.Roboto.Light,
      fontWeight: 'bold',
      fontSize: 20,
      color: 'rgba(149, 168, 244, 1)'
    },
    infoContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8
    },
    rowContainer: {
      flexDirection: 'row'
    },
    description: {
      fontFamily: fonts.Inter.Regular,
      fontSize: 12,
      color: '#000',
      marginBottom: 8,
      marginLeft: 8
    }
  })
}

export default styles
