import React from 'react'
import {
  Modal,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/useTheme'

export type AppModalVariant = 'center' | 'fullscreen'

export interface AppModalProps {
  visible: boolean
  children: React.ReactNode
  onRequestClose?: () => void
  variant?: AppModalVariant
  dismissOnBackdropPress?: boolean
  animationType?: 'none' | 'slide' | 'fade'
  keyboardAvoiding?: boolean
  maxHeight?: number
  contentContainerStyle?: StyleProp<ViewStyle>
  testID?: string
}

/**
 * Shell común para modales: overlay temático + panel card.
 */
const AppModal = ({
  visible,
  children,
  onRequestClose,
  variant = 'center',
  dismissOnBackdropPress = true,
  animationType = 'fade',
  keyboardAvoiding = false,
  maxHeight,
  contentContainerStyle,
  testID,
}: AppModalProps): JSX.Element => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const backdropColor = `${colors.black}A6`

  const panelBase: ViewStyle =
    variant === 'fullscreen'
      ? {
          flex: 1,
          borderRadius: 0,
          marginHorizontal: 0,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }
      : {
          borderRadius: 20,
          marginHorizontal: 16,
          alignSelf: 'stretch',
          maxHeight: maxHeight,
        }

  const panel = (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.background_parts.card,
          borderColor: `${colors.Griss50}22`,
        },
        panelBase,
        contentContainerStyle,
      ]}
      testID={testID}
    >
      {children}
    </View>
  )

  const body = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={variant === 'fullscreen' ? styles.flex : styles.kbWrap}
    >
      {panel}
    </KeyboardAvoidingView>
  ) : (
    panel
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }]}
          onPress={
            dismissOnBackdropPress && onRequestClose ? () => onRequestClose() : undefined
          }
          accessibilityRole="button"
          accessibilityLabel="Cerrar modal"
        />
        <View
          style={variant === 'fullscreen' ? styles.layerFullscreen : styles.layerCenter}
          pointerEvents="box-none"
        >
          {body}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  kbWrap: {
    width: '100%',
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  layerCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  layerFullscreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'stretch',
  },
  panel: {
    borderWidth: 1,
    overflow: 'hidden',
  },
})

export default AppModal
