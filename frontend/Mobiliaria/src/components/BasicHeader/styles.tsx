import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  container: ViewStyle
  title: TextStyle
  logoutLabel: TextStyle
}

const styles = (
  headerBaseHeight: number,
  topInset: number,
  backgroundColor: string,
): StyleTypes => {
  const { fonts } = useTheme()
  return StyleSheet.create({
    container: {
      paddingTop: topInset,
      paddingBottom: Platform.select({ ios: 12, android: 10 }),
      paddingHorizontal: 16,
      minHeight: headerBaseHeight + topInset,
      backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: { elevation: 2 },
      }),
    },
    title: {
      flex: 1,
      fontFamily: fonts.Inter.SemiBold,
      fontSize: 18,
      letterSpacing: 0.2,
    },
    logoutLabel: {
      fontFamily: fonts.Inter.SemiBold,
      fontSize: 14,
    },
  })
}

export default styles
