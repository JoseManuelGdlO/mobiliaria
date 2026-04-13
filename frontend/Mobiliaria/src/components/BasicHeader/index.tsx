import React, { useEffect, useRef } from 'react'
import { BackHandler, Text, TouchableOpacity, View } from 'react-native'
import { NavigationScreens } from '@interfaces/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native'
import _styles from './styles'
import { useTheme } from '@hooks/useTheme'
import BackIcon from '@assets/images/icons/BackIcon'
import useReduxUser from '@hooks/useReduxUser'
import useLogout from '@hooks/useLogout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Props {
  title?: string
  backButtonAction?: () => void
  /** @deprecated use theme defaults; kept for backwards compatibility */
  color?: string
  hideBackArrow?: boolean
  backgroundColor?: string
  showLogout?: boolean
}

export const headerHeight = 56

const BasicHeader = ({
  title = '',
  color,
  backButtonAction,
  hideBackArrow = false,
  backgroundColor: backgroundColorProp,
  showLogout,
}: Props): JSX.Element => {
  const isBlockedRef = useRef(false)
  const [titleState, setTitleState] = React.useState('')
  const { user } = useReduxUser()
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { logout } = useLogout(() => {})

  const backgroundColor = backgroundColorProp ?? colors.background_parts.header
  const titleColor = color ?? colors.Griss50
  const borderColor = `${colors.Griss50}22`

  const styles = _styles(headerHeight, insets.top, backgroundColor)

  const back = (): void => {
    if (isBlockedRef.current) {
      return
    }
    setTimeout(() => {
      isBlockedRef.current = false
    }, 1000)
    isBlockedRef.current = true

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
              routes: [{ name: 'SignedInStack' }],
            }),
          )
        } else {
          return false
        }
        return true
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [navigation]),
  )

  const getTitle = (): void => {
    if (title === 'Home') {
      setTitleState(user?.nombre_comp != null ? `Hola ${user.nombre_comp}` : 'Inicio')
      return
    }
    setTitleState(title)
  }

  useEffect(() => {
    getTitle()
  }, [title, user])

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      {!hideBackArrow && (
        <TouchableOpacity
          hitSlop={{
            top: 10,
            left: 8,
            right: 10,
            bottom: 10,
          }}
          onPress={back}
        >
          <BackIcon color={colors.Griss100} />
        </TouchableOpacity>
      )}

      <Text
        style={[styles.title, { color: titleColor, marginLeft: hideBackArrow ? 0 : 8 }]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {titleState}
      </Text>
      {showLogout && (
        <TouchableOpacity onPress={logout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.logoutLabel, { color: colors.Morado100 }]}>Salir</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default BasicHeader
