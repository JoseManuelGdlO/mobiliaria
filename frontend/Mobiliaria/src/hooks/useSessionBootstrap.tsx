import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useReduxUser from './useReduxUser'
import { updateToken } from '@redux/actions/userAction'
import { getAccessTokenAsync, getRefreshTokenAsync, saveSessionTokens } from '@utils/token'
import { ensureValidAccessToken } from '@services/sessionAuth'

/**
 * Restores and refreshes the auth session before the app renders.
 * Syncs tokens between Redux and AsyncStorage, then renews expired access tokens.
 */
const useSessionBootstrap = (): boolean => {
  const dispatch = useDispatch()
  const { token } = useReduxUser()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async (): Promise<void> => {
      try {
        const storedAccess = await getAccessTokenAsync()
        const storedRefresh = await getRefreshTokenAsync()

        if (token && !storedAccess) {
          await saveSessionTokens(token, storedRefresh || token)
        } else if (!token && storedAccess) {
          dispatch(updateToken(storedAccess))
        }

        await ensureValidAccessToken()
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after persist rehydration
  }, [dispatch])

  return ready
}

export default useSessionBootstrap
