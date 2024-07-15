import React, { useEffect } from 'react'
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import Loading from '@components/loading';
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from '@screens/delivery-map/mapStyle';
const height = Dimensions.get('window').height

interface Props {
    open: boolean
    props: (props?: any) => void
}

export const headerHeight = 56

const SelectStreetMap = ({
    open, 
    props
}: Props): JSX.Element => {
    const mapRef = React.useRef(null)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [ flagPost, setFlagPost ] = React.useState<boolean>(false)

    const [ latlng, setLatlng ] = React.useState<any>({})

    const [optsMaps, setOptsMaps] = React.useState<any>(
        {
            latitude: 24.0248,
            longitude: -104.6608,
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
        <View>
            <Modal visible={open}>
                <View style={{ zIndex: 1, flex: 0.5 }}>
                    <GooglePlacesAutocomplete
                    
                        placeholder='Buscar'
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            if(details?.geometry.location) {
                                setLatlng({
                                    lat: details.geometry.location.lat,
                                    lng: details.geometry.location.lng,
                                    url: details.url,
                                    description: details.formatted_address
                                })
                                moveToLocation(details.geometry.location.lat, details.geometry.location.lng)
                            }
                        }}
                        query={{
                            key: 'AIzaSyCYAngDDCpS9x-HTHxfetZMEy95ZHJXd5k',
                            language: 'es',
                            components: 'country:mx',
                        }}
                        onFail={(error) => console.error(error)}
                        autoFillOnNotFound={true}
                    />
                </View>
                <Loading loading={loading}></Loading>
                {!loading &&
                    <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                        <MapView
                           ref={mapRef}
                           customMapStyle={mapStyle}
                           onLongPress={(e) => {
                            console.log(e.nativeEvent);
                            
                                 setLatlng({
                                      lat: e.nativeEvent.coordinate.latitude,
                                      lng: e.nativeEvent.coordinate.longitude,
                                      url: `https://maps.google.com/?q=${e.nativeEvent.coordinate.latitude},${e.nativeEvent.coordinate.longitude}`,
                                      description: latlng.description
                                 })
                                    moveToLocation(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)


                           }}
                           id='9c40e61721b52d42'
                           provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                           style={styles.mapStyle}
                           initialRegion={optsMaps}
                           >
                            {latlng.lat && 
                                <Marker
                                onDragEnd={(e) => {
                                        setLatlng({
                                            latitude: e.nativeEvent.coordinate.latitude,
                                            longitude: e.nativeEvent.coordinate.longitude,
                                            url: latlng.url,
                                            description: latlng.description
                                        })
                                        moveToLocation(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)
                                                                             
                                    }}
                                    draggable
                                    coordinate={{ latitude: latlng.lat, longitude: latlng.lng }}
                                    title={latlng.description}
                                    description={latlng.url}
                                />}
                           </MapView>
                    </View>}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        padding: 16
                    
                    }}>
                        <Text style={{backgroundColor: '#0000007a', color: '#fff', textAlign: 'center'}}>Arrastra el pin para recolocar la ubicacion</Text>
                        <TouchableOpacity disabled={latlng.lat ? false : true} onPress={() => {
                            console.log(latlng);
                            
                            props(latlng)
                        }}
                            style={{ height: 40, width: '100%', backgroundColor: latlng.lat ? '#35b00a' : '#c2c6c0', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            props()
                        }}
                            style={{ height: 40, width: '100%', marginTop: 10, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ fontFamily: fonts.Roboto.Regular, color: 'white', fontSize: 15 }}>Cancelar</Text>
                        </TouchableOpacity>          
                    </View>
            </Modal>
        </View>
    )
}

export default SelectStreetMap


const styles = StyleSheet.create({
    container: {
        zIndex: 0,
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});