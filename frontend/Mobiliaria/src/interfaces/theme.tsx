
export type ThemeMode = 'dark' | 'light'
export type realThemeMode = 'dark' | 'light' | 'auto'
export interface ThemeType {
  mode: ThemeMode
  realMode: realThemeMode
  colors: Colors
  navigationTheme: NavigationTheme
  paperTheme: PaperTheme
}

export type ApplyThemeAction = ThemeMode
export type SetThemeModeAction = realThemeMode

export type Actions = ApplyThemeAction | SetThemeModeAction

// colors at
// src/redux/reducers/theme.tsx
export interface Colors {
  white: string
  black: string
  transparent: string
  blue: string
  pink: string
  orange: string
  yellow: string
  purple: string
  deepBlue: string
  lightPink: string
  green: string
  red: string
  indigo: string
  blueLight: string
  grey: string
  magenta: string

  text: string
  title: string
  subtitle: string
  background: string

  Griss50: string
  Griss100: string
  Griss200: string
  // Griss300: string
  Griss400: string
  // Griss500: string
  Griss600?: string // <<<< se va a eliminar
  Griss700?: string // <<<< se va a eliminar
  Griss800: string
  // Griss900: string

  Magenta500: string
  Magenta700: string

  Cyan900: string

  DarkViolet300: string

  /**
  Rosa morado light
  */
  Morado100: string
  Morado500: string
  Morado600: string

  icon: {
    footerNoActive: string
    footerActive: string
    noActive: string
    primary: string
  }
  textPrimary: string
  textSecondary: string
  border: {
    feedCard: string
    outlineButton: string
    courseCard: string
    alliesCard: string
    interestPill: string
    profileCard: string
    profileDropDown: string
    nextLesson: string
  }
  background_parts: {
    footer: string
    header: string
    card: string
    profileCard: string
    primaryButton: string
    secondaryButton: string
    courseDetailCard: string
    feedCard: string
    profileDropDown: string
    profileCardIcon: string
    nextLesson: string
  }
  transparentTemplate: {
    10: string
    20: string
    30: string
    40: string
    50: string
    60: string
    70: string
    80: string
    90: string
  }
  // de aqui para abajo se eliminarán
  Neutral50: string
  Neutral100: string
  Neutral200: string
  Neutral300: string
  // Neutral400: string
  Neutral500: string
  // Neutral600: string
  Neutral700: string
  Neutral800: string
  Neutral900: string
  // Exito50: string
  Exito300: string
  // Exito500: string
  // Exito700: string
  Exito900: string
  // Advertencia50: string
  // Advertencia300: string
  // Advertencia500: string
  // Advertencia700: string
  // Advertencia900: string
  Informacion300: string
  // Error50: string
  Error300: string
  Error500: string
  // Error700: string
  Error900: string
  Primario50: string
  // Primario300: string
  Primario500: string
  Primario700: string
  Primario900: string
  // Secundario50: string
  // Secundario300: string
  // Secundario500: string
  // Secundario700: string
  // Secundario900: string
  // Acento50: string
  // Acento300: string
  Acento500: string
  // Acento700: string
  // Acento900: string

  Naranja300: string
  Naranja400: string
  Naranja500: string
  Turquesa400: string
  Turquesa500: string

  gris100: string
  gris200: string
  gris300: string
  gris400: string
  gris500: string
  advertencia300: string
  advertencia400: string
  advertencia500: string
  primario300: string
  primario400: string
  primario500: string
  azul500: string
  exito400: string
  exito500: string

  purple100: string
  ElectricBlue100: string
  ElectricBlue200: string
  ElectricBlue300: string
  DarkBlack100: string
  DarkBlack200: string
  DarkBlack400: string
  DarkBlack500: string
  Violet300: string

  FillsAndStrokes100: string
  FillsAndStrokes200: string
  FillsAndStrokes300: string
  FillsAndStrokes400: string
  FillsAndStrokes500: string
  gray100: string
  gray200: string
  gray300: string
  gray400: string
  gray500: string
  darkBlack100: string
  darkBlack200: string
  darkBlack300: string
  darkBlack400: string
  darkBlack500: string
  electricBlue100: string
  electricBlue200: string
  electricBlue300: string
  electricBlue400: string
  electricBlue500: string
  electricRed100: string
  electricRed200: string
  electricRed300: string
  electricRed400: string
  electricRed500: string
  Blue100: string
  Blue200: string
  Blue300: string
  Blue400: string
  Blue500: string
  orange100: string
  orange200: string
  orange300: string
  orange400: string
  orange500: string
  electricGreen100: string
  electricGreen200: string
  electricGreen300: string
  electricGreen400: string
  electricGreen500: string
  magenta100: string
  magenta200: string
  magenta300: string
  magenta400: string
  magenta500: string
  violet100: string
  violet200: string
  violet300: string
  violet400: string
  violet500: string
  error100: string
  error200: string
  error300: string
  error400: string
  error500: string
  information100: string
  information200: string
  information300: string
  information400: string
  information500: string
  success100: string
  success200: string
  success300: string
  success400: string
  success500: string
  MarcaUERREBlack: string
  MarcaUNID: string
  MarcaUNIDMorado: string
  MarcaUERREMorado: string

}

export interface NavigationTheme {
  dark: boolean
  colors: {
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
  }
}

export interface PaperTheme {
  dark: boolean
  mode?: 'adaptive' | 'exact'
  roundness: number
  colors: {
    primary: string
    background: string
    surface: string
    accent: string
    error: string
    text: string
    onSurface: string
    disabled: string
    placeholder: string
    backdrop: string
    notification: string
  }
  fonts: {
    regular: any
    medium: any
    light: any
    thin: any
  }
  animation: {
    scale: number
  }
}
