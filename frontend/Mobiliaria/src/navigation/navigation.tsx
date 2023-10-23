import React, { useEffect, useRef, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SignedOut from './SignedOut'
import useReduxUser from '@hooks/useReduxUser'

import { Dimensions, Platform, View } from 'react-native'
import { NavigationRouteState, getActiveRouteState } from '@utils/route'
import SignedIn from './SignedIn'
import NewEventFab from '@components/NewEventFab'
import SignedInDelivery from './SignedInDelivery'



const Stack = createNativeStackNavigator()
const windowWidth = Dimensions.get('window').width
const windowheight = Dimensions.get('window').height

export default function Navigation(): JSX.Element {
    const { remember, token, user } = useReduxUser()
    const [activeRouteName, setActiveRouteName] = useState('')
    const maxLottieWidth = 300
    const maxLottieHeight = 300
    let margin = 0
    let translateX = 0
    let translateY = 0
    
    if (windowWidth > maxLottieWidth) {
        margin = (windowWidth - maxLottieWidth) / 4
    }
    if (Platform.OS === 'ios') {
        translateX = margin
        translateY = (windowheight - maxLottieHeight) / 5.0
    } else {
        translateX = margin
        translateY = (windowheight - maxLottieHeight) / 4.5
    }
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    orientation: 'portrait'
                }}
                screenListeners={{
                    state: e => {
                        if (e.data !== undefined) {
                            const activeRoute = getActiveRouteState(e.data as NavigationRouteState)                            
                            setActiveRouteName(activeRoute?.name ?? '')
                        }
                    }
                }}
            >
                {

                    token
                        ? user.rol_usuario !== 'Repartidor' 
                        ? <Stack.Screen name='SignedInStack' component={SignedIn} /> 
                        : <Stack.Screen name='SignedWorkerStack' component={SignedInDelivery} />
                        : <Stack.Screen name='SignedOutStack' component={SignedOut} />
                }

            </Stack.Navigator>
            <NewEventFab activeRouteName={activeRouteName} />
        </View>
    )
}
