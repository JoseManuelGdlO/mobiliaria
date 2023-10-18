import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

interface StyleTypes {
    textHola: TextStyle
}

const styles = (): StyleTypes => {
    return StyleSheet.create({
        textHola: {
            color: '#000000'
        }
    })
}

export default styles
