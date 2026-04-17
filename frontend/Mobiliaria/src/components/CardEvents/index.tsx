/* eslint-disable @typescript-eslint/naming-convention */
import { View, Text } from 'react-native'
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
  data: any
}

const CardEvents = ({
  data,
}: Props): JSX.Element => {
  const navigation = useNavigation<StackNavigationProp<NavigationScreens>>()
  const { colors } = useTheme()
  const styles = _styles()
  const iconMuted = colors.gris300
  const paid = data.pagado_evento === 1
  const timeStr = `${data.hora_envio_evento.split(':')[0]}:${data.hora_envio_evento.split(':')[1]}`

  return (
    <TouchableRipple
      borderless={false}
      rippleColor={`${colors.Morado100}33`}
      onPress={() => {
        navigation.navigate('EventDetail', { id: data.id_evento })
      }}
      style={styles.rippleContainer}
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <TeamLine width={22} height={22} color={colors.Morado100} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {data.nombre_titular_evento}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        <View style={styles.metaRow}>
          <Book2Line width={16} height={16} color={iconMuted} />
          <Text style={styles.address} numberOfLines={3}>
            {data.direccion_evento}
          </Text>
        </View>

        {Boolean(data.repartidor_nombre) && (
          <View style={[styles.metaRow, { marginTop: 6 }]}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={16} color={iconMuted} />
            <Text style={styles.address} numberOfLines={1}>
              {String(data.repartidor_nombre)}
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BookMarkLine width={16} height={16} color={iconMuted} />
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: paid ? `${colors.exito500}2E` : `${colors.red}2E`,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: paid ? colors.exito400 : colors.red },
              ]}
            >
              {paid ? 'Pagado' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  )
}

export default CardEvents
