import React from "react"
import { Text, TouchableOpacity, View } from 'react-native'
import _styles from './styles'

const Login = (): JSX.Element => {
    
    const styles = _styles()
    return (
        <View style={{ flex: 1 }}>
                <Text style={styles.textHola}>Login</Text>
        </View>
    )
}
export default Login