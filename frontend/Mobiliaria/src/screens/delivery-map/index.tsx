import { useTheme } from "@hooks/useTheme"
import React, { useEffect } from "react"
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from './mapStyle';
import Geolocation from '@react-native-community/geolocation';
import Loading from "@components/loading";


const DeliveryMap = (): JSX.Element => {
    const [loading, setLoading] = React.useState<boolean>(true)
    const [ flagPost, setFlagPost ] = React.useState<boolean>(false)
    const mapRef = React.useRef(null)

    const [ latlng, setLatlng ] = React.useState<any>({})

    const [optsMaps, setOptsMaps] = React.useState<any>(
      {
          latitude: 41.3995345,
          longitude: 2.1909796,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008
      })

  const { fonts, colors } = useTheme()

  Geolocation.getCurrentPosition(info => {
      if(flagPost) return
      moveToLocation(info.coords.latitude, info.coords.longitude)
      setFlagPost(true)
      setLoading(false)
  });

  const moveToLocation = (latitude:any, longitude: any) => {
      if(!mapRef.current) return
      mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008
      }, 2000)
  } 

    useEffect(() => {

    }, [])

    return (
    <View style={styles.container}>
      <Loading loading={loading}></Loading>
      { !loading && 
      <MapView ref={mapRef} customMapStyle={mapStyle} provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT} style={styles.mapStyle} initialRegion={optsMaps}></MapView>}
    </View>
    )
}
export default DeliveryMap

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapStyle: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });