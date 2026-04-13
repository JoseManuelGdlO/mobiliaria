import React, { useEffect } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@hooks/useTheme'
import AppModal from '@components/AppModal'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import Loading from '@components/loading';
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from '@screens/delivery-map/mapStyle';
import PrimaryButton from '@components/PrimaryButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
    open: boolean
    props: (props?: any) => void
}

export const headerHeight = 56

const SelectStreetMap = ({
    open, 
    props
}: Props): JSX.Element => {
    const mapRef = React.useRef<MapView | null>(null)
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
    const insets = useSafeAreaInsets()

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

    const placesStyles = {
        container: {
            flex: 0,
            zIndex: 99,
        },
        textInputContainer: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0,
        },
        textInput: {
            height: 48,
            color: colors.Griss50,
            fontSize: 16,
            fontFamily: fonts.Inter.Regular,
            backgroundColor: `${colors.Griss50}0C`,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: `${colors.Morado100}44`,
            paddingHorizontal: 14,
        },
        listView: {
            backgroundColor: colors.background_parts.card,
            borderRadius: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: `${colors.Morado100}33`,
            maxHeight: 220,
        },
        row: {
            backgroundColor: colors.background_parts.card,
            paddingVertical: 12,
            paddingHorizontal: 14,
        },
        separator: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: `${colors.Morado100}33`,
        },
        description: {
            fontFamily: fonts.Inter.Regular,
            fontSize: 14,
            color: colors.Griss50,
        },
    }

    return (
        <View>
            <AppModal
                visible={open}
                variant="fullscreen"
                dismissOnBackdropPress={false}
                animationType="slide"
                onRequestClose={() => props()}
            >
                <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
                    <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 8, zIndex: 100 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <MaterialCommunityIcons name="map-search-outline" size={26} color={colors.Morado100} />
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 20, color: colors.Griss50, marginLeft: 10, flex: 1 }}>
                                Ubicación en mapa
                            </Text>
                            <TouchableOpacity onPress={() => props()} hitSlop={12}>
                                <MaterialCommunityIcons name="close" size={26} color={colors.gris300} />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                alignSelf: 'flex-start',
                                marginBottom: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: `${colors.Morado600}33`,
                                borderWidth: 1,
                                borderColor: `${colors.Morado100}44`,
                            }}
                        >
                            <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 13, color: colors.Morado100 }}>
                                Busca o mantén pulsado el mapa
                            </Text>
                        </View>
                        <GooglePlacesAutocomplete
                            placeholder='Buscar dirección'
                            placeholderTextColor={colors.gris400}
                            fetchDetails={true}
                            enablePoweredByContainer={false}
                            debounce={400}
                            minLength={2}
                            styles={placesStyles}
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
                            textInputProps={{
                                placeholderTextColor: colors.gris400,
                            }}
                        />
                    </View>
                    <Loading loading={loading}></Loading>
                    {!loading &&
                        <View style={{ flex: 1, minHeight: 0 }}>
                            <MapView
                               ref={mapRef}
                               customMapStyle={mapStyle}
                               onLongPress={(e) => {
                                    setLatlng({
                                        lat: e.nativeEvent.coordinate.latitude,
                                        lng: e.nativeEvent.coordinate.longitude,
                                        url: `https://maps.google.com/?q=${e.nativeEvent.coordinate.latitude},${e.nativeEvent.coordinate.longitude}`,
                                        description: latlng.description
                                    })
                                    moveToLocation(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)
                               }}
                               provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                               style={styles.mapFill}
                               initialRegion={optsMaps}
                               >
                                {latlng.lat != null && latlng.lng != null &&
                                    <Marker
                                        onDragEnd={(e) => {
                                            setLatlng({
                                                lat: e.nativeEvent.coordinate.latitude,
                                                lng: e.nativeEvent.coordinate.longitude,
                                                url: latlng.url,
                                                description: latlng.description
                                            })
                                            moveToLocation(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)
                                        }}
                                        draggable
                                        coordinate={{ latitude: latlng.lat, longitude: latlng.lng }}
                                        title={latlng.description}
                                        description={latlng.url}
                                    >
                                        <MaterialCommunityIcons name="map-marker" size={44} color={colors.Morado100} />
                                    </Marker>}
                           </MapView>
                        </View>}
                    <View style={{
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: Math.max(insets.bottom, 16) + 8,
                        backgroundColor: colors.background_parts.card,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: `${colors.Morado100}33`,
                    }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                backgroundColor: `${colors.Morado600}22`,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: `${colors.Morado100}33`,
                                padding: 12,
                                marginBottom: 14,
                            }}
                        >
                            <MaterialCommunityIcons name="gesture-tap-hold" size={22} color={colors.Morado100} style={{ marginRight: 10, marginTop: 2 }} />
                            <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 13, color: colors.gris300, flex: 1, lineHeight: 18 }}>
                                Arrastra el pin para ajustar la ubicación, o busca una dirección arriba.
                            </Text>
                        </View>
                        <PrimaryButton
                            disabled={!latlng.lat}
                            containerStyle={{
                                width: '100%',
                                paddingVertical: 14,
                                borderRadius: 14,
                                minHeight: 50,
                                marginBottom: 10,
                            }}
                            textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.white }}
                            backgroundButton={colors.Morado600}
                            onPress={() => {
                                props(latlng)
                            }}
                            title="Confirmar ubicación"
                        />
                        <PrimaryButton
                            containerStyle={{
                                width: '100%',
                                paddingVertical: 14,
                                borderRadius: 14,
                                minHeight: 50,
                                borderWidth: 1.5,
                                borderColor: `${colors.Morado100}66`,
                                backgroundColor: 'transparent',
                            }}
                            textStyle={{ fontSize: 15, fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }}
                            backgroundButton="transparent"
                            onPress={() => {
                                props()
                            }}
                            title="Cancelar"
                        />
                    </View>
                </View>
            </AppModal>
        </View>
    )
}

export default SelectStreetMap


const styles = StyleSheet.create({
    mapFill: {
        ...StyleSheet.absoluteFillObject,
    },
});
