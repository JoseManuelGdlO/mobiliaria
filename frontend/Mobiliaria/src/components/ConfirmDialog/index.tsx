import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AppModal from '@components/AppModal'
import { useTheme } from '@hooks/useTheme'

export type ConfirmDialogTone = 'default' | 'danger'

export interface ConfirmDialogProps {
  open: boolean
  /** Título corto (ej. «Eliminar evento»). */
  headline?: string
  /** Texto explicativo; si no se envía, se usa un mensaje genérico. */
  title?: string
  notsure: () => void
  sure: () => void
  confirmLabel?: string
  cancelLabel?: string
  /** danger = acción destructiva (botón de confirmar en rojo). */
  tone?: ConfirmDialogTone
}

/**
 * Confirmación con AppModal y tipografía del tema (alineado con el resto de la app).
 */
const ConfirmDialog = ({
  open,
  notsure,
  sure,
  title,
  headline = 'Confirmar',
  confirmLabel = 'Continuar',
  cancelLabel = 'Cancelar',
  tone = 'default',
}: ConfirmDialogProps): JSX.Element => {
  const { fonts, colors } = useTheme()

  const message =
    title ??
    '¿Estás seguro de que deseas continuar? Esta acción puede afectar los datos mostrados.'

  const isDanger = tone === 'danger'
  const confirmBg = isDanger ? colors.red : colors.Morado600
  const iconBg = isDanger ? `${colors.red}28` : `${colors.Morado600}33`
  const iconName = isDanger ? 'alert-circle-outline' : 'help-circle-outline'
  const iconColor = isDanger ? colors.red : colors.Morado100

  return (
    <AppModal visible={open} onRequestClose={notsure} animationType="fade" dismissOnBackdropPress>
      <View style={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isDanger ? `${colors.red}44` : `${colors.Morado100}44`,
            }}
          >
            <MaterialCommunityIcons name={iconName} size={30} color={iconColor} />
          </View>
        </View>
        <Text
          style={{
            fontFamily: fonts.Inter.SemiBold,
            fontSize: 20,
            color: colors.Griss50,
            textAlign: 'center',
            letterSpacing: 0.2,
          }}
        >
          {headline}
        </Text>
        <Text
          style={{
            fontFamily: fonts.Inter.Regular,
            fontSize: 15,
            color: colors.gris300,
            lineHeight: 22,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          {message}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 22 }}>
          <TouchableOpacity
            onPress={notsure}
            activeOpacity={0.85}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: `${colors.Morado100}66`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6,
            }}
          >
            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.Griss50 }}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={sure}
            activeOpacity={0.85}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: confirmBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 6,
            }}
          >
            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 15, color: colors.white }}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  )
}

export default ConfirmDialog
