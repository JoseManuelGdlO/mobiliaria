
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { Dimensions } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Login from '../screens/Login'
import Delivery from '@screens/delivery'
import BasicHeader from '@components/BasicHeader'

const Stack = createNativeStackNavigator()
export default function SignedInDelivery(): JSX.Element {
    const { colors } = useTheme()
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: colors.title,
                headerBackTitle: ' '
            }}
        >
            <Stack.Group>
                <Stack.Screen options={{ title: 'Entregas', headerShown: true, header: () => <BasicHeader hideBackArrow showLogout title='Eventiva trabajadores' /> }} name='Delivery' component={Delivery} />
            </Stack.Group>
        </Stack.Navigator>
    )
}