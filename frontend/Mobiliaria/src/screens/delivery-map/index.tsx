import { useTheme } from "@hooks/useTheme"
import React, { useEffect, useRef, useState } from "react"
import { Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from './mapStyle';
import * as eventService from '../../services/events';
import Geolocation from '@react-native-community/geolocation';
import Loading from "@components/loading";
import DatePicker from "react-native-date-picker";
import PrimaryButton from "@components/PrimaryButton";
import ArrowRight from "@assets/images/icons/ArrowRight";
const height = Dimensions.get('window').height
import { Linking } from "react-native";
import TruckPin from "@assets/images/icons/TruckPin";
import LottieView from "lottie-react-native";
import { io } from "socket.io-client";
import useReduxUser from "@hooks/useReduxUser";


const DeliveryMap = (): JSX.Element => {
  const { user } = useReduxUser()
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const [provitionalDate, setProvitionalDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const animation = useRef(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [flagPost, setFlagPost] = useState<boolean>(false)
  const mapRef = useRef(null)
  const [url, setUrl] = useState<string>('')

  const [events, setEvents] = useState<any>([])

  const [driversMarker, setDriversMarker] = useState<any>([])

  const wSRecibed = () => {
    const socket = io('http://192.168.1.70:3000');

    socket.on('connect', function () {
      console.log('Websocket Connected with App');
    });

    socket.on('empresa_' + user.id_empresa, (msg) => {

      setDriversMarker(msg)
    });

  }

  const closeModal = (): void => {
    setVisible(false)
  }

  const goToAvailable = (): void => {
    setDate(provitionalDate)
    setEvents([])
    getEventsDay(provitionalDate.toISOString().split('T')[0])
    setVisible(false)
  }


  const [optsMaps, setOptsMaps] = React.useState<any>(
    {
      latitude: -104.641382,
      longitude: 24.0035672,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008
    })

  const { fonts, colors } = useTheme()

  Geolocation.getCurrentPosition(info => {

    if (flagPost) return
    moveToLocation(24.0035672, -104.641382)
    setFlagPost(true)
  });

  const moveToLocation = (latitude: any, longitude: any) => {

    if (!mapRef.current) return

    mapRef.current.animateToRegion({
      latitude,
      longitude,
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

      const localEvents = []
      for (const item of response.data) {

        if (item.lng && item.lng !== 'none') {
          localEvents.push(item)
        }
      }
      setEvents(localEvents)
      if (localEvents.length !== 0) {
        moveToLocation(localEvents[0].lat, localEvents[0].lng)
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
    <>
      <TouchableOpacity onPress={() => {
        setVisible(true)
      }} style={{ zIndex: 10, width: '100%' }}>
        <Text style={{ color: '#000', fontSize: 15, fontWeight: '100', paddingHorizontal: 20, fontFamily: fonts.Roboto.Regular, backgroundColor: '#FFF' }}> {getDatePipe()}</Text>
        <View style={{ position: 'absolute', right: 20, marginTop: 5, backgroundColor: 'freen' }}>
          <ArrowRight color="#000"></ArrowRight>
        </View>
      </TouchableOpacity>
      {url !== '' &&
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(url)
          }}
          style={{ height: 20, width: '100%', paddingHorizontal: 10, backgroundColor: '#FFF', position: 'absolute', zIndex: 99, top: 25 }}>
          <Text style={{ color: 'blue' }}>{url}</Text>
        </TouchableOpacity>}
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          customMapStyle={mapStyle}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          style={styles.mapStyle}
          initialRegion={optsMaps}>
          {events.length !== 0 &&
            <>
              {
                events.map((item: any, index: number) => (
                  <Marker
                    key={index}
                    coordinate={{ latitude: parseFloat(item.lat), longitude: parseFloat(item.lng) }}
                    title={item.nombre_titular_evento}
                    description={item.direccion_evento}
                    onPress={() => {
                      setUrl(item.url)
                    }}
                  />
                ))
              }
            </>}
          {driversMarker.length !== 0 &&
            <>
              {
                driversMarker.map((item: any, index: number) => (
                  <Marker
                    key={index}
                    coordinate={{ latitude: parseFloat(item.location.coords.latitude), longitude: parseFloat(item.location.coords.longitude) }}
                    title={item.nombre_titular_evento}
                    description={item.direccion_evento}
                  >
                    <LottieView
                      ref={animation}
                      autoPlay
                      loop={false}
                      style={{
                        width: 120,
                        height: 120,
                        backgroundColor: 'transparent',
                      }}
                      // Find more Lottie files at https://lottiefiles.com/featured
                      source={require('../../assets/images/lottie/truck.json')}
                    />
                  </Marker>
                ))
              }
            </>}
        </MapView>
        <Modal visible={visible} transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 10, margin: 20, maxHeight: height - 100 }}>
              <Text style={{ fontFamily: fonts.Inter.Bold, fontWeight: 'bold', fontSize: 16, color: '#FFF', marginTop: 16, marginLeft: 16 }}>
                Dia a revisar
              </Text>
              <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: '#FFF', marginTop: 5, marginLeft: 16 }}>
                selecciona el dia
              </Text>
              <ScrollView style={{ margin: 20 }} showsVerticalScrollIndicator={false}>
                <DatePicker
                  open={open}
                  date={date}
                  locale='es'
                  mode='date'
                  onDateChange={(date) => {
                    setUrl('')
                    setProvitionalDate(date)
                  }}
                />
              </ScrollView>
              <View style={{ margin: 16, display: 'flex', flexDirection: 'row' }}>
                <PrimaryButton
                  containerStyle={{ width: '50%' }}
                  onPress={goToAvailable}
                  title='Aceptar'
                />
                <PrimaryButton
                  containerStyle={{ width: '50%' }}
                  onPress={closeModal}
                  backgroundButton='red'
                  title='Cancelar'
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <Loading loading={loading}></Loading>
    </>

  )
}
export default DeliveryMap

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});