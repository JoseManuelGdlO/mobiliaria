
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { Dimensions } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Login from '../screens/Login'

const Stack = createNativeStackNavigator()
export default function SignedOut(): JSX.Element {
    const { colors } = useTheme()
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: colors.title,
                headerBackTitle: ' '
            }}
        >
            <Stack.Group>
                <Stack.Screen options={{ title: 'Detalle de curso', headerShown: false }} name='Login' component={Login} />
            </Stack.Group>
        </Stack.Navigator>
    )
}
