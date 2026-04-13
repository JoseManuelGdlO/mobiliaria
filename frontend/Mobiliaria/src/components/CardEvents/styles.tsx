import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface StyleTypes {
  rippleContainer: ViewStyle
  container: ViewStyle
  topRow: ViewStyle
  iconWrap: ViewStyle
  titleBlock: ViewStyle
  title: TextStyle
  metaRow: ViewStyle
  address: TextStyle
  footerRow: ViewStyle
  timeText: TextStyle
  chevron: TextStyle
  badge: ViewStyle
  badgeText: TextStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()
  return StyleSheet.create({
    rippleContainer: {
      borderRadius: 16,
    },
    container: {
      borderRadius: 16,
      backgroundColor: colors.background_parts.feedCard,
      borderWidth: 1,
      borderColor: `${colors.Griss50}12`,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: `${colors.Morado600}35`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    titleBlock: {
      flex: 1,
      paddingRight: 8,
    },
    title: {
      fontFamily: fonts.Inter.SemiBold,
      fontSize: 16,
      color: colors.Griss50,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.Griss50}18`,
    },
    address: {
      flex: 1,
      marginLeft: 10,
      fontFamily: fonts.Inter.Regular,
      fontSize: 13,
      color: colors.gris300,
      lineHeight: 19,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    timeText: {
      marginLeft: 8,
      fontFamily: fonts.Inter.Medium,
      fontSize: 13,
      color: colors.Griss100,
    },
    chevron: {
      fontSize: 22,
      color: colors.gris400,
      fontWeight: '300',
      marginTop: -4,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: {
      fontFamily: fonts.Inter.SemiBold,
      fontSize: 11,
      letterSpacing: 0.3,
    },
  })
}

export default styles
