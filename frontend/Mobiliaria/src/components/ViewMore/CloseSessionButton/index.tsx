import useLogout from '@hooks/useLogout'
import React from 'react'
import { ActivityIndicator, Text } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import _styles from './styles'
import { useTheme } from '@hooks/useTheme'
import Loading from '@components/loading'

const CloseSessionButton = (): JSX.Element => {
  const styles = _styles()
  const { colors } = useTheme()

  const { logout, loading } = useLogout(() => {})

  return (
    <>
      {loading ? (
        <ActivityIndicator color={colors.Morado100} style={{ marginVertical: 16 }} />
      ) : (
        <TouchableRipple
          style={styles.container}
          onPress={logout}
          rippleColor={`${colors.red}33`}
        >
          <Text style={styles.title}>Cerrar sesión</Text>
        </TouchableRipple>
      )}
      <Loading loading={loading} />
    </>
  )
}

export default CloseSessionButton
