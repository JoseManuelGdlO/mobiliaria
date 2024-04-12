import { useTheme } from "@hooks/useTheme"
import React, { useEffect } from "react"
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from './mapStyle';


const DeliveryMap = (): JSX.Element => {
    const [loading, setLoading] = React.useState<boolean>(true)

    const { fonts, colors } = useTheme()

    useEffect(() => {

    }, [])

    return (
    <View style={styles.container}>
      <MapView customMapStyle={mapStyle} provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT} style={styles.mapStyle}initialRegion={{
          latitude: 41.3995345,
          longitude: 2.1909796,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}mapType="standard"></MapView>
    </View>
    )
}
export default DeliveryMap

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapStyle: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });