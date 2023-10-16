import colors from '@theme/colors'
import React, { memo } from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

type TextProps = React.ComponentProps<typeof Text>

interface props {
  customIcon?: any
  text: string
  textStyle?: TextStyle
  iconStyle?: ViewStyle
  containerStyle?: ViewStyle
  textProps?: TextProps
  positionIcon?: 'right' | 'left'
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    textAlignVertical: 'center',
    flexDirection: 'row',
    marginStart: 0,
    // justifyContent: 'space-between',
    textAlign: 'center',
    marginEnd: 0,
    alignContent: 'center'
  },
  text: {
    color: colors.Primario900,
    marginHorizontal: 8,
    fontSize: 16
  }
})

const TextIcon = ({ text, positionIcon = 'left', textStyle = {}, iconStyle, containerStyle = {}, textProps, customIcon }: props): JSX.Element => {
  return (
    <View style={[styles.container, containerStyle]}>
      {positionIcon === 'left' &&
        <View style={iconStyle}>
          {customIcon}
        </View>}
      <Text style={[styles.text, textStyle]} {...textProps}>{text}</Text>
      {positionIcon === 'right' &&
        <View style={iconStyle}>
          {customIcon}
        </View>}
    </View>
  )
}

export default memo(TextIcon)
