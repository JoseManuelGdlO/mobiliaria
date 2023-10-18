import { View, Text, ViewStyle, TextStyle } from 'react-native'
import React, { memo } from 'react'
import _styles from './styles'
import { TouchableRipple } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { NavigationScreens } from '@interfaces/navigation'
import ArrowRight from '@assets/images/icons/ArrowRight'

export interface Option {
  name: string
  icon?: JSX.Element
  navigate?: string
  customAction?: () => void
  params?: object
  modalRef?: any
}

interface props {
  modalRef?: any
  containerStyle?: ViewStyle
  textStyle?: TextStyle
  hideBottomLine?: boolean
  hideRightArrow?: boolean
  name?: any
  icon?: any
  navigate?: any
  customAction?: any
  params?: any
}

const ViewMoreItem = ({
  name,
  icon,
  navigate,
  customAction,
  params,
  modalRef,
  containerStyle = {},
  textStyle = {},
  hideBottomLine = false,
  hideRightArrow = false
}: props): JSX.Element => {
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const styles = _styles()
  const goScreen = (): void => {
    if (navigate !== undefined && navigate.length > 0) {
      if (modalRef !== undefined) {
        modalRef.current.close()
      }
      navigation.navigate(navigate, params ?? {})
      return
    }
    if (customAction !== undefined) {
      customAction()
    }
  }
  return (
    <>
      <TouchableRipple
        onPress={goScreen}
        rippleColor='rgba(0, 0, 0, .32)'
        borderless
      >
        <View style={styles.mainContainer}>
          <View style={[styles.container, containerStyle]}>
            {
              icon !== undefined
                ? icon
                : <View style={{ height: 24, width: 24 }} />
            }
            <Text style={[styles.title, textStyle]}>{name}</Text>
          </View>
          {
            !hideRightArrow && <ArrowRight />
          }
        </View>
      </TouchableRipple>
      {
        !hideBottomLine && <View style={styles.line} />
      }
    </>
  )
}

export default memo(ViewMoreItem)
