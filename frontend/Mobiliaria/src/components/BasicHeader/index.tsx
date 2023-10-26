import React, { useEffect, useMemo, useRef } from 'react'
import { Alert, BackHandler, Text, TouchableOpacity, View } from 'react-native'
import { NavigationScreens } from '@interfaces/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import SaveButton from './SaveButton'
import _styles from './styles'
import { useTheme } from '@hooks/useTheme'
import BackIcon from '@assets/images/icons/BackIcon'
import useReduxUser from '@hooks/useReduxUser'
import useLogout from '@hooks/useLogout'

interface Props {
  title?: string
  backButtonAction?: () => void
  color?: string
  hideBackArrow?: boolean
  backgroundColor?: string
  showLogout?: boolean
}

export const headerHeight = 56

const BasicHeader = ({
  title = '',
  color = 'black',
  backButtonAction,
  hideBackArrow = false,
  backgroundColor = 'white',
  showLogout
}: Props): JSX.Element => {
  const isBlockedRef = useRef(false)
  const [titleState, setTitleState] = React.useState('')
  const { user } = useReduxUser()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const route = useRoute()
  const styles = _styles(headerHeight, backgroundColor, hideBackArrow)
  const { colors } = useTheme()
  const { logout, loading } = useLogout(() => { })

  const back = (): void => {
    // Previene ejecutar dos veces la acción antes de cargar
    if (isBlockedRef.current) {
      return
    }
    setTimeout(() => { isBlockedRef.current = false }, 1000)
    isBlockedRef.current = true
    // fin

    if (backButtonAction !== undefined) {
      backButtonAction()
      return
    }
    navigation.goBack()
  }

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = (): boolean => {
        const state = navigation.getState()
        if (state.routes.length === 1) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'SignedInStack' }

              ]
            })
          )
        } else {
          return false
        }
        return true
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [navigation])
  )

  const getTitle = () => {
    if (title === 'Home') {
      setTitleState(`Hola ${user.nombre_comp} 👋🏻`)
      return
    }
    setTitleState(title)
  }

  useEffect(() => {
    getTitle()
  })


  return (
    <View style={styles.container}>
      {
        !hideBackArrow
        && (
          <TouchableOpacity
            hitSlop={{
              top: 10,
              left: 8,
              right: 10,
              bottom: 10
            }}
            onPress={back}
          >
            <BackIcon color={colors.DarkBlack200} />
          </TouchableOpacity>)
      }

      <Text style={[styles.title, { color }]} numberOfLines={1} >{titleState}</Text>
      {
        showLogout
        && (
          <TouchableOpacity onPress={logout} style={{ width: 30 }}>
            <Text style={{ width: '100%' }}>
              Salir
            </Text>
          </TouchableOpacity>)
      }
    </View>
  )
}

export default BasicHeader
