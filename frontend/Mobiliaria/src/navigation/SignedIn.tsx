
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { Dimensions } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Login from '../screens/Login'
import Home from '@screens/home'
import BasicHeader from '@components/BasicHeader'
import { FooterMenu } from './FooterMenu'
import Payments from '@screens/payments'
import Clients from '@screens/clients/clients'

const windowWidth = Dimensions.get('window').width

const Stack = createNativeStackNavigator()

const shadowStyle = {
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
}
export default function SignedIn(): JSX.Element {
    const { colors } = useTheme()
    return (
        <>
            <Stack.Navigator
                screenOptions={{
                    headerTintColor: colors.title,
                    headerBackTitle: ' '
                }}
            >
                <Stack.Group>
                    <Stack.Screen
                        name='Root'
                        component={FooterMenu}
                        options={{
                            headerShown: false,
                            title: '',
                            headerBackTitle: 'Regresar'

                        }}
                    />
                    <Stack.Screen options={{ title: 'Clientes', headerShown: true, header: (props) => <BasicHeader  title='Catalogo de clientes 🚏' backgroundColor='white' /> }} name='Clients' component={Clients} />
                    <Stack.Screen options={{ title: 'Seguimiento a pagos', headerShown: true, header: (props) => <BasicHeader hideBackArrow color='#00bcbb' title='Home' backgroundColor='white' /> }} name='Payments' component={Payments} />
                </Stack.Group>
            </Stack.Navigator>
        </>
    )
}
