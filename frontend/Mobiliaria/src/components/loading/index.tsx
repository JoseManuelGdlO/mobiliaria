/* eslint-disable @typescript-eslint/naming-convention */
import { View, Text, Alert, StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import LottieView from 'lottie-react-native'


interface Props {
    loading: boolean
}


const Loading = ({
    loading = false,
}: Props): JSX.Element => {
    const animation = useRef(null);
    return (
        !loading ? <></> :
        <View style={styles.animationContainer}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                }}
                // Find more Lottie files at https://lottiefiles.com/featured
                source={require('../../assets/images/lottie/loading.json')}
            />
        </View>
    
    )
}
export default Loading;

const styles = StyleSheet.create({
    animationContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.56)',
    }
});
