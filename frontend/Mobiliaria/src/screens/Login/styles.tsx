import { useTheme } from '@hooks/useTheme'
import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native'

interface StyleTypes {
  root: ViewStyle
  contentContainer: ViewStyle
  logo: ViewStyle
  brandText: TextStyle
  card: ViewStyle
  title: TextStyle
  subtitle: TextStyle
  inputContainer: ViewStyle
  input: TextStyle
  button: ViewStyle
  buttonText: TextStyle
  bottomRow: ViewStyle
  rememberWrap: ViewStyle
  rememberText: TextStyle
  helpButton: ViewStyle
  helpText: TextStyle
  errorText: TextStyle
  legalLinksContainer: ViewStyle
  legalLinkText: TextStyle
}

const styles = (): StyleTypes => {
  const { colors, fonts } = useTheme()

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.DarkViolet300,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    logo: {
      width: '100%',
      height: 180,
      alignSelf: 'center',
      marginBottom: 4,
    },
    brandText: {
      fontFamily: fonts.Inter.Bold,
      fontSize: 34,
      color: colors.Griss50,
      textAlign: 'center',
      marginBottom: 14,
      letterSpacing: 0.3,
    },
    card: {
      borderRadius: 20,
      backgroundColor: colors.background_parts.card,
      paddingHorizontal: 18,
      paddingVertical: 20,
      borderWidth: 1,
      borderColor: `${colors.gris400}55`,
      ...Platform.select({
        ios: {
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.28,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    title: {
      fontFamily: fonts.Inter.SemiBold,
      color: colors.Griss50,
      fontSize: 24,
    },
    subtitle: {
      fontFamily: fonts.Inter.Regular,
      color: colors.gris300,
      fontSize: 13,
      marginTop: 4,
      marginBottom: 14,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gris400,
      backgroundColor: `${colors.DarkBlack500}1A`,
      paddingHorizontal: 12,
      height: 50,
      marginTop: 10,
    },
    input: {
      flex: 1,
      marginLeft: 8,
      color: colors.Griss50,
      fontFamily: fonts.Inter.Regular,
      fontSize: 14,
      paddingVertical: 0,
    },
    button: {
      backgroundColor: colors.Morado600,
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 20,
    },
    buttonText: {
      fontFamily: fonts.Inter.SemiBold,
      color: colors.white,
      fontSize: 15,
      textAlign: 'center',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      gap: 8,
    },
    rememberWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rememberText: {
      fontFamily: fonts.Inter.Regular,
      color: colors.gris300,
      fontSize: 12,
      marginLeft: 4,
    },
    helpButton: {
      paddingVertical: 6,
      paddingLeft: 8,
    },
    helpText: {
      fontFamily: fonts.Inter.Regular,
      color: colors.Morado100,
      fontSize: 12,
    },
    errorText: {
      fontFamily: fonts.Inter.SemiBold,
      color: colors.red,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 14,
    },
    legalLinksContainer: {
      marginTop: 14,
      alignItems: 'center',
      gap: 8,
    },
    legalLinkText: {
      fontFamily: fonts.Inter.Medium,
      color: colors.Morado100,
      fontSize: 12,
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
  })
}

export default styles
