
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { Dimensions } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Login from '../screens/Login'

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
                <Stack.Screen
                    options={{
                        headerShown: false,
                        title: ''
                        // demo custom header
                        // headerLeft (props) {
                        //   return (
                        //     <>
                        //       <TouchableOpacity onPress={() => { }}>
                        //         <View>
                        //           <Icon name={Icons.Flechas.chicoIzquierda} fill='#000' height={12} width={12} />
                        //         </View>
                        //       </TouchableOpacity>
                        //     </>
                        //   )
                        // }
                    }}
                    name='Login'
                    component={Login}
                />
            </Stack.Group>
        </Stack.Navigator>
    )
}
