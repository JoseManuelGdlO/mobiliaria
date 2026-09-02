import axios from 'axios'
import Toast from 'react-native-toast-message'
import store from '@redux/reducers'
import { removeLoginData, updateToken } from '@redux/actions/userAction'
import {
  clearSessionTokens,
  getAccessTokenAsync,
  getRefreshTokenAsync,
  saveSessionTokens,
} from '@utils/token'
import { ensureApiBaseUrl } from '@utils/remote-config'
import { isAccessTokenExpired } from '@utils/jwt'

let refreshPromise: Promise<string | null> | null = null
let invalidationPromise: Promise<void> | null = null

export const isUnauthorizedStatus = (status?: number): boolean =>
  status === 401 || status === 409

export const invalidateSession = async (notify = false): Promise<void> => {
  if (invalidationPromise) {
    return invalidationPromise
  }

  invalidationPromise = (async () => {
    await clearSessionTokens()
    store.dispatch(updateToken(''))
    store.dispatch(removeLoginData())
    if (notify) {
      Toast.show({
        type: 'info',
        text1: 'Sesión expirada',
        text2: 'Vuelve a iniciar sesión para continuar.',
      })
    }
  })().finally(() => {
    invalidationPromise = null
  })

  return invalidationPromise
}

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshTokenAsync()
    if (!refreshToken) {
      await invalidateSession(true)
      return null
    }

    try {
      const base = await ensureApiBaseUrl()
      const { data } = await axios.post(
        `${String(base || '').replace(/\/$/, '')}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
      const nextAccessToken = data?.accessToken || data?.token
      const nextRefreshToken = data?.refreshToken || refreshToken
      if (!nextAccessToken) {
        await invalidateSession(true)
        return null
      }
      await saveSessionTokens(nextAccessToken, nextRefreshToken)
      store.dispatch(updateToken(nextAccessToken))
      return nextAccessToken
    } catch {
      await invalidateSession(true)
      return null
    }
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export const ensureValidAccessToken = async (): Promise<string | null> => {
  const accessToken = await getAccessTokenAsync()
  const refreshToken = await getRefreshTokenAsync()

  if (!accessToken && !refreshToken) {
    return null
  }

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    store.dispatch(updateToken(accessToken))
    return accessToken
  }

  if (!refreshToken) {
    if (accessToken) {
      await invalidateSession(true)
    }
    return null
  }

  return refreshAccessToken()
}
