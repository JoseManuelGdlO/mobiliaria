import { DefaultTheme } from 'react-native-paper'
import { ThemeType, Colors, NavigationTheme, ThemeMode, PaperTheme, ApplyThemeAction, SetThemeModeAction } from '../../interfaces/theme'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

const colors = (_mode: ThemeMode): Colors => ({
  white: _mode === 'dark' ? '#000000' : '#FFFFFF',
  black: _mode === 'dark' ? '#FFFFFF' : '#000000',
  transparent: 'transparent',
  blue: '#00C1DE',
  pink: '#EC1C6D',
  orange: '#FF8000',
  yellow: '#EDBF00',
  purple: '#B474D9',
  deepBlue: '#0030FF',
  lightPink: '#FC7EB2',
  green: '#84E349',
  red: '#F74F58',
  indigo: '#041860',
  blueLight: '#a1e1f0',
  grey: '#bdbdbd',
  magenta: '#D50057',

  text: _mode === 'dark' ? '#F5F5F5' : '#F5F5F5',
  title: _mode === 'dark' ? '#F5F5F5' : '#F5F5F5',
  subtitle: _mode === 'dark' ? '#E0E0E0' : '#E0E0E0',
  background: _mode === 'dark' ? '#111111' : '#111111',
  textPrimary: _mode === 'dark' ? '#A86FFB' : '#A86FFB',
  textSecondary: _mode === 'dark' ? '#FF8000' : '#FF8000',
  icon: {
    footerNoActive: _mode === 'dark' ? '#828D9E' : '#828D9E',
    footerActive: _mode === 'dark' ? '#A86FFB' : '#A86FFB',
    noActive: _mode === 'dark' ? '#A0A9BA' : '#A0A9BA',
    primary: _mode === 'dark' ? '#A86FFB' : '#A86FFB'
  },
  border: {
    feedCard: _mode === 'dark' ? '#828D9E' : '#828D9E',
    outlineButton: _mode === 'dark' ? '#828D9E' : '#828D9E',
    courseCard: _mode === 'dark' ? '#A0A9BA' : '#A0A9BA',
    alliesCard: _mode === 'dark' ? '#68768D' : '#68768D',
    interestPill: _mode === 'dark' ? '#FFFFFF26' : '#FFFFFF26',
    profileCard: _mode === 'dark' ? '#FFFFFF26' : '#FFFFFF26',
    profileDropDown: _mode === 'dark' ? '#FFFFFF26' : '#FFFFFF26',
    nextLesson: _mode === 'dark' ? '#219EBC' : '#219EBC'
  },
  background_parts: {
    footer: _mode === 'dark' ? '#000000' : '#000000',
    header: _mode === 'dark' ? '#000000' : '#000000',
    card: _mode === 'dark' ? '#1B1F25' : '#1B1F25',
    primaryButton: _mode === 'dark' ? '#3D23D8' : '#3D23D8',
    secondaryButton: _mode === 'dark' ? '#222730' : '#222730',
    courseDetailCard: _mode === 'dark' ? '#1C1F24' : '#1C1F24',
    feedCard: _mode === 'dark' ? '#1C1F24' : '#1C1F24',
    profileCard: _mode === 'dark' ? '#2C3236' : '#2C3236',
    profileDropDown: _mode === 'dark' ? '#1C1F24' : '#1C1F24',
    profileCardIcon: _mode === 'dark' ? '#1C1F24' : '#1C1F24',
    nextLesson: _mode === 'dark' ? '#219EBC29' : '#219EBC29'
  },
  // nuevos
  gris100: _mode === 'dark' ? '#F1F3F6' : '#F1F3F6',
  gris200: _mode === 'dark' ? '#DDDFE3' : '#DDDFE3',
  gris300: _mode === 'dark' ? '#828D9E' : '#828D9E',
  gris400: _mode === 'dark' ? '#2C3236' : '#2C3236',
  gris500: _mode === 'dark' ? '#1C1F24' : '#1C1F24',

  advertencia300: _mode === 'dark' ? '#F2C80B' : '#F2C80B',
  advertencia400: _mode === 'dark' ? '#FF9933' : '#FF9933',
  advertencia500: _mode === 'dark' ? '#FF8000' : '#FF8000',

  primario300: _mode === 'dark' ? '#2ECFE8' : '#2ECFE8',
  primario400: _mode === 'dark' ? '#00C1DE' : '#00C1DE',
  primario500: _mode === 'dark' ? '#219EBC' : '#219EBC',

  azul500: _mode === 'dark' ? '#00FFFF' : '#00FFFF',

  exito400: _mode === 'dark' ? '#84E349' : '#84E349',
  exito500: _mode === 'dark' ? '#55B01C' : '#55B01C',

  purple100: _mode === 'dark' ? '#A86FFB' : '#A86FFB',
  Morado100: _mode === 'dark' ? '#A86FFB' : '#A86FFB',
  Morado500: _mode === 'dark' ? '#580CC7' : '#580CC7',
  Morado600: _mode === 'dark' ? '#3D23D8' : '#3D23D8',

  Griss50: _mode === 'dark' ? '#F5F5F5' : '#F5F5F5',
  Griss100: _mode === 'dark' ? '#EBEBEB' : '#EBEBEB',
  Griss200: _mode === 'dark' ? '#E0E0E0' : '#E0E0E0',
  Griss400: _mode === 'dark' ? '#CCCCCC' : '#CCCCCC',
  Griss600: _mode === 'dark' ? '#d1d1d1' : '#d1d1d1',
  Griss700: _mode === 'dark' ? '#bcbcbc' : '#bcbcbc',
  Griss800: _mode === 'dark' ? '#404150' : '#404150',

  Magenta500: _mode === 'dark' ? '#3900D9' : '#3900D9',
  Magenta700: _mode === 'dark' ? '#8B3FFA' : '#8B3FFA',

  Cyan900: _mode === 'dark' ? '#A0A9BA' : '#A0A9BA',

  DarkViolet300: _mode === 'dark' ? '#1C1F24' : '#1C1F24',

  Neutral50: _mode === 'dark' ? '#FAFAFB' : '#FAFAFB',
  Neutral100: _mode === 'dark' ? '#DCDFE5' : '#DCDFE5',
  Neutral200: _mode === 'dark' ? '#555f76' : '#555f76',
  Neutral300: _mode === 'dark' ? '#A0A9BA' : '#A0A9BA',
  Neutral500: _mode === 'dark' ? '#2b313a' : '#2b313a',
  Neutral700: _mode === 'dark' ? '#8f99ac' : '#8f99ac',
  Neutral800: _mode === 'dark' ? '#1C1F24' : '#1C1F24',
  Neutral900: _mode === 'dark' ? '#111317' : '#111317',

  Exito300: _mode === 'dark' ? '#01ED8C' : '#01ED8C',
  Exito900: _mode === 'dark' ? '#55B01C' : '#55B01C',

  Informacion300: _mode === 'dark' ? '#FCDC43' : '#FCDC43',

  Error300: _mode === 'dark' ? '#ce070f' : '#ce070f',
  Error500: _mode === 'dark' ? '#9b070f' : '#9b070f',
  Error900: _mode === 'dark' ? '#f65059' : '#f65059',

  Primario50: _mode === 'dark' ? '#00d0f4' : '#00d0f4',
  Primario500: _mode === 'dark' ? '#0d6e7d' : '#0d6e7d',
  Primario700: _mode === 'dark' ? '#5fe6fb' : '#5fe6fb',
  Primario900: _mode === 'dark' ? '#45e2fa' : '#45e2fa',

  Acento500: _mode === 'dark' ? '#a00c45' : '#a00c45',

  Naranja300: _mode === 'dark' ? '#FFA700' : '#FFA700',
  Naranja400: _mode === 'dark' ? '#FF9933' : '#FF9933',
  Naranja500: _mode === 'dark' ? '#FF8000' : '#FF8000',

  Turquesa400: _mode === 'dark' ? '#00C1DE' : '#00C1DE',
  Turquesa500: _mode === 'dark' ? '#219EBC' : '#219EBC',

  ElectricBlue100: _mode === 'dark' ? '#B8B4EC' : '#B8B4EC',
  ElectricBlue200: _mode === 'dark' ? '#8177E1' : '#8177E1',
  ElectricBlue300: _mode === 'dark' ? '#3900D9' : '#3900D9',

  DarkBlack100: _mode === 'dark' ? '#B8B8BB' : '#B8B8BB',
  DarkBlack200: _mode === 'dark' ? '#78787D' : '#78787D',
  DarkBlack400: _mode === 'dark' ? '#141124' : '#141124',
  DarkBlack500: _mode === 'dark' ? '#000000' : '#000000',

  Violet300: _mode === 'dark' ? '#9F6FFB' : '#9F6FFB',

  transparentTemplate: {
    90: 'E6',
    80: 'CC',
    70: 'B3',
    60: '99',
    50: '80',
    40: '66',
    30: '4D',
    20: '33',
    10: '1A'
  },

  FillsAndStrokes100: '#A0A9BA',
  FillsAndStrokes200: '#404150',
  FillsAndStrokes300: '#2C3236',
  FillsAndStrokes400: '#1C1F24',
  FillsAndStrokes500: '#111111',

  gray100: '#F5F5F5',
  gray200: '#F1F1F1',
  gray300: '#E0E0E0',
  gray400: '#D6D6D6',
  gray500: '#CCCCCC',

  darkBlack100: '#B8B8BB',
  darkBlack200: '#78787D',
  darkBlack300: '#1D1934',
  darkBlack400: '#141124',
  darkBlack500: '#000000',

  electricBlue100: '#B8B4EC',
  electricBlue200: '#8177E1',
  electricBlue300: '#3900D9',
  electricBlue400: '#2B00A5',
  electricBlue500: '#1F0076',

  electricRed100: '#FDE9EB',
  electricRed200: '#FA9EA7',
  electricRed300: '#F83B5A',
  electricRed400: '#C02D45',
  electricRed500: '#831F2F',

  Blue100: '#E7F5FE',
  Blue200: '#A3DEFC',
  Blue300: '#26C5FB',
  Blue400: '#1C93BB',
  Blue500: '#105870',

  orange100: '#FFEFE4',
  orange200: '#FFCB99',
  orange300: '#FFA700',
  orange400: '#BD7B00',
  orange500: '#724A00',

  electricGreen100: '#EDFAE4',
  electricGreen200: '#C4F0A1',
  electricGreen300: '#99E83A',
  electricGreen400: '#78B62D',
  electricGreen500: '#527C1F',

  magenta100: '#F5C9EA',
  magenta200: '#E878CB',
  magenta300: '#DF43B7',
  magenta400: '#9F2F82',
  magenta500: '#7F2668',

  violet100: '#E6D5FD',
  violet200: '#CDACFC',
  violet300: '#9F6FFB',
  violet400: '#8B3FFA',
  violet500: '#482F6B',

  error100: '#FCDBDC',
  error200: '#FAAAAD',
  error300: '#F74F58',
  error400: '#C73F46',
  error500: '#8D2D32',

  information100: '#FDF1CB',
  information200: '#FCE694',
  information300: '#FCDC43',
  information400: '#D8BD39',
  information500: '#B39D2F',

  success100: '#E1FFEC',
  success200: '#AEF9CD',
  success300: '#01ED8C',
  success400: '#00C675',
  success500: '#009256',

  MarcaUERREBlack: '#231F20',
  MarcaUNID: '#F1BA28',
  MarcaUNIDMorado: '#121134',
  MarcaUERREMorado: '#39277A'

})
const navigationTheme = (_mode: ThemeMode): NavigationTheme => {
  const _colors = colors(_mode)
  return {
    dark: _mode === 'dark',
    colors: {
      primary: _colors.Magenta700,
      background: _colors.background,
      card: _colors.background,
      text: _colors.gris200,
      border: _colors.Neutral500,
      notification: _colors.blue
    }
  }
}
const paperTheme = (_mode: ThemeMode): PaperTheme => {
  const _colors = colors(_mode)
  return {
    ...DefaultTheme,
    roundness: 4,
    colors: {
      ...DefaultTheme.colors,
      primary: _colors.Magenta500,
      accent: _colors.Magenta500,
      background: navigationTheme(_mode).colors.background,
      text: _colors.text,
      placeholder: _colors.Neutral300,
      disabled: _colors.gris300,
      surface: _colors.gris300,
      notification: _colors.blue,
    },
    fonts: {
      ...DefaultTheme.fonts,
      regular: {
        fontFamily: 'Roboto-Regular',
        fontWeight: 'normal'
      },
      medium: {
        fontFamily: 'Roboto-Medium',
        fontWeight: 'normal'
      },
      light: {
        fontFamily: 'Roboto-Light',
        fontWeight: 'normal'
      },
      thin: {
        fontFamily: 'Roboto-Thin',
        fontWeight: 'normal'
      }
    }
  }
}

const initialState: ThemeType = {
  mode: 'dark',
  realMode: 'dark',
  colors: colors('dark'),
  navigationTheme: navigationTheme('dark'),
  paperTheme: paperTheme('dark')
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ApplyThemeAction>) => {
      state.mode = action.payload
      state.colors = colors(action.payload)
      state.navigationTheme = navigationTheme(action.payload)
      state.paperTheme = paperTheme(action.payload)
    },
    setThemeMode: (state, action: PayloadAction<SetThemeModeAction>) => {
      state.realMode = action.payload
    }
  }
})

export default themeSlice.reducer
