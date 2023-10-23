import { useTheme } from '@hooks/useTheme'
import React from 'react'
import { Text, TextStyle, ViewStyle } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import _styles from './styles'
import TextIcon from '@components/TextIcon'

type TextProps = React.ComponentProps<typeof Text>

interface props {
  title: string
  onPress: () => void
  disabled?: boolean
  mIcon?: string
  mIconColor?: string
  mIconSize?: number
  backgroundButton?: string
  onLongPress?: () => void
  containerStyle?: ViewStyle
  customIcon?: any
  textProps?: TextProps
  sharedIconName?: string
  iconStrokeColor?: string
  OctiIconName?: string
  textStyle?: TextStyle
  positionIcon?: 'right' | 'left'
}

const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  mIcon,
  mIconColor,
  mIconSize,
  backgroundButton = '#3D23D8',
  onLongPress,
  containerStyle = {},
  customIcon,
  textProps,
  sharedIconName,
  iconStrokeColor,
  OctiIconName,
  textStyle,
  positionIcon
}: props): JSX.Element => {
  const styles = _styles()
  const { colors } = useTheme()
  backgroundButton = backgroundButton ?? colors.ElectricBlue300
  return (
    <TouchableRipple
      style={[styles.container, { backgroundColor: backgroundButton }, disabled && { backgroundColor: colors.FillsAndStrokes400 }, containerStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      rippleColor='rgba(0, 0, 0, .32)'
      borderless
    >
      <TextIcon
        customIcon={customIcon}
        text={title}
        textStyle={disabled ? styles.titleDisabled : (textStyle ?? styles.title)}
        textProps={textProps}
        positionIcon={positionIcon}
      />
    </TouchableRipple>
  )
}

export default PrimaryButton
