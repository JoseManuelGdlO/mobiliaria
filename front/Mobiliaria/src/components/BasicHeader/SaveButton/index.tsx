import { useTheme } from '@hooks/useTheme'
import React from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-paper'

interface props {
  disabled: boolean
  onPress: () => void
}

const SaveButton = ({ disabled = false, onPress }: props): JSX.Element => {
  const { colors, fonts } = useTheme()
  return (
    <View style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center'
    }}
    >
      <Button
        mode='text'
        disabled={disabled}
        onPress={onPress}
        theme={{
          dark: true
        }}
        labelStyle={{
          textTransform: 'none',
          fontFamily: fonts.Inter.Regular,
          fontSize: 12,
          color: disabled ? colors.Neutral300 : colors.Morado100
        }}
      >
        Guardar
      </Button>
    </View>
  )
}

export default SaveButton
