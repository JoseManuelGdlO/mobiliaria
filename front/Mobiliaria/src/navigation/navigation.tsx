import React, { useEffect, useRef, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
// import SignedIn from './SignedIn'
import SignedOut from './SignedOut'
import useReduxUser from '@hooks/useReduxUser'

import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native'
import { NavigationRouteState, getActiveRouteState } from '@utils/route'
import { useTheme } from '../hooks/useTheme'



const Stack = createNativeStackNavigator()
const windowWidth = Dimensions.get('window').width
const windowheight = Dimensions.get('window').height

export default function Navigation(): JSX.Element {
    const { realUser } = useReduxUser()

    const { colors } = useTheme()


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
            >
                {
                    realUser.email.length > 0
                        ? <Stack.Screen name='SignedInStack' component={SignedOut} />
                        : <Stack.Screen name='SignedInStack' component={SignedOut} />
                }

            </Stack.Navigator>
        </View>
    )
}
