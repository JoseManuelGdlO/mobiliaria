import { useTheme } from "@hooks/useTheme"
import React, { useEffect, useRef, useState } from "react"
import { Platform, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from './mapStyle';
import * as eventService from '../../services/events';
import Geolocation from '@react-native-community/geolocation';
import Loading from "@components/loading";
import DatePickerComponent from "@components/datepicker";
import { Linking } from "react-native";
import { io } from "socket.io-client";
import useReduxUser from "@hooks/useReduxUser";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/** Convierte lat/lng del API a números válidos para MapView (evita NaN). Corrige par lat/lng invertido. */
function parseMapCoordinate(latRaw: unknown, lngRaw: unknown): { latitude: number; longitude: number } | null {
  const toNum = (v: unknown): number => {
    if (v == null) return NaN
    const s = String(v).trim().replace(',', '.')
    if (s === '' || s.toLowerCase() === 'none' || s === 'null' || s === 'undefined') return NaN
    return parseFloat(s)
  }
  let lat = toNum(latRaw)
  let lng = toNum(lngRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  // Algunos registros guardan longitud en "lat" y viceversa (p. ej. -104 / 24 en México)
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    const t = lat
    lat = lng
    lng = t
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { latitude: lat, longitude: lng }
}

const DeliveryMap = (): JSX.Element => {
  const { user } = useReduxUser()
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const [provitionalDate, setProvitionalDate] = useState(new Date())
  const [loading, setLoading] = useState<boolean>(true)
  const [flagPost, setFlagPost] = useState<boolean>(false)
  const mapRef = useRef<MapView | null>(null)
  const [url, setUrl] = useState<string>('')

  const [events, setEvents] = useState<any>([])

  const [driversMarker, setDriversMarker] = useState<any>([])

  const wSRecibed = () => {
    const socket = io('http://192.168.0.21:3000');

    socket.on('connect', function () {
      console.log('Websocket Connected with App in Map');
    });

    socket.on('empresa_' + user.id_empresa, (msg) => {
      console.log('Websocket Received', msg);
      const list = Array.isArray(msg) ? msg : msg != null ? [msg] : []
      setDriversMarker(list)
    });

  }

  const onDatePickerResult = (picked: Date | null): void => {
    setVisible(false)
    if (picked != null) {
      setDate(picked)
      setProvitionalDate(picked)
      setUrl('')
      setEvents([])
      getEventsDay(picked.toISOString().split('T')[0])
    }
  }

  const [optsMaps, setOptsMaps] = React.useState(
    {
      latitude: 24.0035672,
      longitude: -104.641382,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08
    })

  const { fonts, colors } = useTheme()

  Geolocation.getCurrentPosition(info => {

    if (flagPost) return
    moveToLocation(24.0035672, -104.641382)
    setFlagPost(true)
  });

  const moveToLocation = (latitude: any, longitude: any) => {
    const lat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude))
    const lng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude))
    if (!mapRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) return

    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: .2,
      longitudeDelta: .02
    }, 2000)
  }

  const getDatePipe = (): string => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const getEventsDay = async (date: string) => {
    try {
      setLoading(true)
      const response = await eventService.getEventsDay(date)

      const localEvents: any[] = []
      for (const item of response.data) {
        if (parseMapCoordinate(item.lat, item.lng) != null) {
          localEvents.push(item)
        }
      }
      setEvents(localEvents)
      if (localEvents.length !== 0) {
        const c = parseMapCoordinate(localEvents[0].lat, localEvents[0].lng)
        if (c != null) {
          moveToLocation(c.latitude, c.longitude)
        }
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    const date = new Date().toISOString().split('T')[0]
    getEventsDay(date),
      wSRecibed()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
      <TouchableOpacity
        onPress={() => {
          setProvitionalDate(date)
          setVisible(true)
        }}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: colors.background_parts.card,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: `${colors.Morado100}33`,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: `${colors.Morado600}38`,
            borderWidth: 1,
            borderColor: `${colors.Morado100}44`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={24} color={colors.Morado100} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 12, color: colors.gris300, letterSpacing: 0.2 }}>
            Entregas del día
          </Text>
          <Text style={{ color: colors.Griss50, fontSize: 17, paddingTop: 2, fontFamily: fonts.Inter.SemiBold }}>
            {getDatePipe()}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gris300} />
      </TouchableOpacity>
      {url !== '' &&
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(url)
          }}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.background_parts.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: `${colors.Morado100}22`,
          }}
        >
          <MaterialCommunityIcons name="link-variant" size={20} color={colors.Morado100} style={{ marginRight: 10 }} />
          <Text style={{ color: colors.primario300, fontFamily: fonts.Inter.Medium, fontSize: 13, flex: 1 }} numberOfLines={2}>{url}</Text>
        </TouchableOpacity>}
      <View style={{ flex: 1, minHeight: 0 }}>
        <MapView
          ref={mapRef}
          customMapStyle={mapStyle}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          style={StyleSheet.absoluteFill}
          initialRegion={optsMaps}>
          {events.length !== 0 &&
            <>
              {
                events.map((item: any, index: number) => {
                  const coord = parseMapCoordinate(item.lat, item.lng)
                  if (coord == null) return null
                  return (
                  <Marker
                    key={item.id_evento ?? item.id ?? `ev-${index}`}
                    coordinate={coord}
                    title={item.nombre_titular_evento}
                    description={item.direccion_evento}
                    onPress={() => {
                      setUrl(item.url)
                    }}
                  >
                    <MaterialCommunityIcons name="map-marker" size={40} color={colors.Morado100} />
                  </Marker>
                  )
                })
              }
            </>}
          {driversMarker.length !== 0 &&
            <>
              {
                driversMarker.map((item: any, index: number) => {
                  const latRaw = item?.location?.coords?.latitude
                  const lngRaw = item?.location?.coords?.longitude
                  const coord = parseMapCoordinate(latRaw, lngRaw)
                  if (coord == null) return null
                  return (
                  <Marker
                    key={item.id_usuario ?? item.id ?? `drv-${index}`}
                    coordinate={coord}
                    title={item.nombre_titular_evento}
                    description={item.direccion_evento}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <View
                        style={{
                          backgroundColor: `${colors.Morado600}EE`,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderRadius: 22,
                          borderWidth: 2,
                          borderColor: `${colors.Griss50}66`,
                          shadowColor: colors.black,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.35,
                          shadowRadius: 3,
                          elevation: 4,
                        }}
                      >
                        <MaterialCommunityIcons name="truck" size={26} color={colors.white} />
                      </View>
                    </View>
                  </Marker>
                  )
                })
              }
            </>}
        </MapView>
      </View>

      <DatePickerComponent
        open={visible}
        date={provitionalDate}
        mode="date"
        onChangePicker={onDatePickerResult}
      />

      <Loading loading={loading}></Loading>
    </View>

  )
}
export default DeliveryMap
