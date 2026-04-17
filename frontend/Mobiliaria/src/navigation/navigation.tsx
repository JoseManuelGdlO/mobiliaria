import React from 'react'
import SignedOut from './SignedOut'
import useReduxUser from '@hooks/useReduxUser'
import { useTheme } from '@hooks/useTheme'

import { View } from 'react-native'
import SignedIn from './SignedIn'
import SignedInDelivery from './SignedInDelivery'
import { isDeliveryRole } from '@utils/permissions'

/**
 * Auth switching mounts one navigator tree at a time.
 * Swapping Stack.Screen children inside one Stack.Navigator breaks React Navigation
 * and can crash the app right after login when token state updates.
 */
export default function Navigation(): JSX.Element {
    const { token, user } = useReduxUser()
    const { colors } = useTheme()

    const signedInBody = isDeliveryRole(user?.rol_usuario) ? <SignedInDelivery /> : <SignedIn />

    return (
        <View style={{ flex: 1, backgroundColor: colors.background_parts.header }}>
            {!token ? <SignedOut /> : signedInBody}
        </View>
    )
}
