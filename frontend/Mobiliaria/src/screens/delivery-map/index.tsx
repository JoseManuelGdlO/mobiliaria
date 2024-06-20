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


const DeliveryMap = (): JSX.Element => {
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const [provitionalDate, setProvitionalDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const animation = useRef(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [flagPost, setFlagPost] = useState<boolean>(false)
  const mapRef = useRef(null)

  const [events, setEvents] = useState<any>([])


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
    console.log('info', info.coords.latitude, info.coords.longitude);
    
    if (flagPost) return
    moveToLocation(24.0035672, -104.641382)
    setFlagPost(true)
  });

  const moveToLocation = (latitude: any, longitude: any) => {

    if (!mapRef.current) return


    console.log('latitude', latitude, 'longitude', longitude, 'mapRef', mapRef.current);
    
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
          console.log('item', item.lng, item.lat, item.nombre_titular_evento);

          localEvents.push(item)
        }
      }
      setEvents(localEvents)
      if (localEvents.length !== 0) {
        console.log('localEvents', localEvents[0].lng);
        
        moveToLocation(localEvents[0].lat, localEvents[0].lng)
      }

      console.log('events', events);
      


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    const date = new Date().toISOString().split('T')[0]
    getEventsDay(date)
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
      <View style={styles.container}>
        <Loading loading={loading}></Loading>
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
                          title={item.description}
                          
                          description={item.url}
                        />
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