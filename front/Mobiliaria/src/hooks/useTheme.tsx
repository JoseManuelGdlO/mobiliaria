import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../App'
import { Colors, NavigationTheme, PaperTheme, realThemeMode, ThemeMode } from '../interfaces/theme'
import { setTheme } from '../redux/actions/themeActions'

interface useThemeTypes {
  mode: ThemeMode
  realMode: realThemeMode
  setTheme: (theme: 'dark' | 'light') => void
  colors: Colors
  navigationTheme: NavigationTheme
  paperTheme: PaperTheme
  fonts: {
    Inter: {
      Black: string
      Bold: string
      ExtraBold: string
      ExtraLight: string
      Light: string
      Medium: string
      Regular: string
      SemiBold: string
      Thin: string
    }
    Prata: {
      Regular: string
    }
    Roboto: {
      Black: string
      BlackItalic: string
      Bold: string
      BoldItalic: string
      Italic: string
      Light: string
      LightItalic: string
      Medium: string
      MediumItalic: string
      Regular: string
      Thin: string
      ThinItalic: string
    }
    SourceSansPro: {
      Black: string
      BlackItalic: string
      Bold: string
      BoldItalic: string
      ExtraLight: string
      ExtraLightItalic: string
      Italic: string
      Light: string
      LightItalic: string
      Regular: string
      SemiBold: string
      SemiBoldItalic: string
    }
  }
}

export const useTheme = (): useThemeTypes => {
  const dispatch = useDispatch()

  const { mode, realMode, colors, navigationTheme, paperTheme } = useSelector((state: RootState) => state.theme)

  const _setTheme = (mode: ThemeMode): void => {
    dispatch(setTheme(mode))
  }

  const fonts = {
    Inter: {
      Black: 'Inter-Black',
      Bold: 'Inter-Bold',
      ExtraBold: 'Inter-ExtraBold',
      ExtraLight: 'Inter-ExtraLight',
      Light: 'Inter-Light',
      Medium: 'Inter-Medium',
      Regular: 'Inter-Regular',
      SemiBold: 'Inter-SemiBold',
      Thin: 'Inter-Thin'
    },
    Prata: {
      Regular: 'Prata-Regular'
    },
    Roboto: {
      Black: 'Roboto-Black',
      BlackItalic: 'Inter-BlackItalic',
      Bold: 'Roboto-Bold',
      BoldItalic: 'Roboto-BoldItalic',
      Italic: 'Roboto-Italic',
      Light: 'Roboto-Light',
      LightItalic: 'Roboto-LightItalic',
      Medium: 'Roboto-Medium',
      MediumItalic: 'Roboto-MediumItalic',
      Regular: 'Roboto-Regular',
      Thin: 'Roboto-Thin',
      ThinItalic: 'Roboto-ThinItalic'
    },
    SourceSansPro: {
      Black: 'SourceSansPro-Black',
      BlackItalic: 'SourceSansPro-BlackItalic',
      Bold: 'SourceSansPro-Bold',
      BoldItalic: 'SourceSansPro-BoldItalic',
      ExtraLight: 'SourceSansPro-ExtraLight',
      ExtraLightItalic: 'SourceSansPro-ExtraLightItalic',
      Italic: 'SourceSansPro-Italic',
      Light: 'SourceSansPro-Light',
      LightItalic: 'SourceSansPro-LightItalic',
      Regular: 'SourceSansPro-Regular',
      SemiBold: 'SourceSansPro-SemiBold',
      SemiBoldItalic: 'SourceSansPro-SemiBoldItalic'
    }
  }

  return {
    mode,
    realMode,
    setTheme: _setTheme,
    colors,
    navigationTheme,
    paperTheme,
    fonts
  }
}
// Ejemplo de uso

// import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native'
// import { useTheme } from '../../../hooks/useTheme'

// interface StyleTypes {
//   container: ViewStyle
//   image: ImageStyle
//   title: TextStyle
// }

// const styles = (): StyleTypes => {
//   const { colors } = useTheme()
//   return StyleSheet.create({
//     container: {
//       padding: 16
//     },
//     image: {
//       padding: 16
//     },
//     title: {
//       fontSize: 18,
//       color: colors.Neutral700,
//       fontFamily: 'Roboto-Bold',
//       height: 50
//     },
//   })
// }
// export default styles

// Uso en el componente
// import _styles from './styles'

// const styles = _styles()

// return (
//   <View style={styles.card}>
