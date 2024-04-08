/* eslint-disable @typescript-eslint/naming-convention */
import { View, Text, Alert } from 'react-native'
import React from 'react'
import _styles from './styles'
import { useTheme } from '@hooks/useTheme'
import { TouchableRipple } from 'react-native-paper'
import Book2Line from '@assets/images/icons/Book2Line'
import BookMarkLine from '@assets/images/icons/BookMarkLine'
import TeamLine from '@assets/images/icons/TeamLine'
import { NavigationScreens } from '@interfaces/navigation'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'


interface Props {
  data: any
}


const CardEvents = ({
  data,
}: Props): JSX.Element => {
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const { colors } = useTheme()
  const styles = _styles()

  return (
    <TouchableRipple
      borderless
      onPress={() => { navigation.navigate('EventDetail', { id: data.id_evento })}}
      style={styles.rippleContainer}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TeamLine width={24} height={24} color="#95a8f4" />
          <Text style={styles.title}>{data.nombre_titular_evento}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.rowContainer}>
            <Book2Line />
            <Text style={styles.description}>Direccion: {data.direccion_evento}</Text>
          </View>
          <View style={styles.rowContainer}>
            <BookMarkLine />
            <Text style={styles.description}>Hora: {`${data.hora_envio_evento.split(':')[0]}:${data.hora_envio_evento.split(':')[1]}`}</Text>
          </View>
          <View style={styles.rowContainer}>
            <BookMarkLine />
            <Text style={[styles.description, {color: data.pagado_evento === 1 ? 'green' : 'red'}]}>{data.pagado_evento === 1 ? 'Pagado' : 'No pagado'}</Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  )
}

export default CardEvents
