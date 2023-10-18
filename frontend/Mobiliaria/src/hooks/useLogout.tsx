import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Toast from 'react-native-toast-message'
import useReduxUser from './useReduxUser'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { NavigationScreens } from '@interfaces/navigation'
import { updateToken, removeLoginData, rememberUser } from '@redux/actions/userAction'

interface UseLogoutTypes {
  logout: () => void
  loading: boolean
}

const useLogout = (onLogout = () => { }): UseLogoutTypes => {
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const dispatch = useDispatch()
  const { user, token } = useReduxUser()
  const [loading, setLoading] = useState(false)

  const enviroment = 'env'
  const logout = async (): Promise<void> => {
    console.log('Cerrando sesión')
    setLoading(true)
      try {
        console.log('Eliminando FCM token')
        if (token !== undefined && token.length > 0) {
          dispatch(updateToken(''))
        }
        dispatch(removeLoginData())
        dispatch(rememberUser(false))
        setLoading(false)
      } catch (error) {
        setLoading(false)
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Ha ocurrido un error, por favor intente más tarde.'
        })
      }
  }

  return {
    logout,
    loading
  }
}

export default useLogout
