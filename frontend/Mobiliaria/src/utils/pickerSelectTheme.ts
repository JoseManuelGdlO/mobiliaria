import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { PickerStyle } from 'react-native-picker-select'

/**
 * Estilos para `react-native-picker-select` alineados con la app (tema oscuro / Morado).
 * Usar con `useNativeAndroidPickerStyle={false}` y `darkTheme` en iOS para que no se vea el spinner nativo raro.
 */
export function createAppPickerSelectStyle(
    colors: {
        Griss50: string
        gris400: string
        Morado100: string
        DarkViolet300: string
        background_parts?: { header: string; card?: string }
    },
    fonts: { Inter: { Regular: string; SemiBold: string } },
): PickerStyle {
    const text: TextStyle = {
        fontSize: 15,
        fontFamily: fonts.Inter.Regular,
        color: colors.Griss50,
    }

    const headerBg = colors.background_parts?.header ?? colors.DarkViolet300
    const sheetBg = colors.background_parts?.card ?? colors.DarkViolet300

    return {
        viewContainer: {
            alignSelf: 'stretch',
            width: '100%',
        },
        inputIOSContainer: {
            width: '100%',
        },
        inputAndroidContainer: {
            width: '100%',
            minHeight: 48,
            justifyContent: 'center',
        },
        inputIOS: {
            ...text,
            paddingVertical: 12,
            paddingRight: 30,
        },
        inputAndroid: {
            ...text,
            paddingVertical: 10,
            paddingRight: 34,
        },
        placeholder: {
            color: colors.gris400,
        },
        iconContainer: {
            top: Platform.OS === 'ios' ? 11 : 13,
            right: 0,
        },
        headlessAndroidContainer: {
            position: 'relative',
            width: '100%',
            minHeight: 48,
            justifyContent: 'center',
        } as ViewStyle,
        headlessAndroidPicker: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
        },
        modalViewMiddle: {
            backgroundColor: headerBg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: `${colors.Griss50}22`,
        },
        modalViewBottom: {
            backgroundColor: sheetBg,
        },
        modalViewBottomDark: {
            backgroundColor: sheetBg,
        },
        done: {
            color: colors.Morado100,
            fontWeight: '600',
            fontSize: 16,
            fontFamily: fonts.Inter.SemiBold,
        },
        doneDark: {
            color: colors.Morado100,
        },
    }
}
