import { useTheme } from '@hooks/useTheme'
import { IHistorical } from '@interfaces/event-details'
import React from 'react'
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native'

interface Props {
  historial?: IHistorical[]
}

const formatDate = (raw: string | undefined): string => {
  if (!raw) return '—'
  const parts = raw.split('T')[0]?.split('-')
  if (!parts || parts.length < 3) return raw
  const [y, m, d] = parts
  return `${d}/${m}/${y.slice(2)}`
}

const HistoryEvent = ({ historial = [] }: Props): JSX.Element => {
  const { fonts, colors } = useTheme()

  const renderItem: ListRenderItem<IHistorical> = ({ item }) => (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: `${colors.Griss50}18`,
          backgroundColor: `${colors.Griss50}06`,
        },
      ]}
    >
      <View style={styles.rowHeader}>
        <Text style={[styles.date, { fontFamily: fonts.Inter.SemiBold, color: colors.Morado100 }]}>
          {formatDate(item.date)}
        </Text>
      </View>
      <Text style={[styles.label, { fontFamily: fonts.Inter.Medium, color: colors.gris300 }]}>Usuario</Text>
      <Text style={[styles.value, { fontFamily: fonts.Inter.SemiBold, color: colors.Griss50 }]}>
        {item.nombre_comp?.trim() ? item.nombre_comp : '—'}
      </Text>
      <Text style={[styles.label, { fontFamily: fonts.Inter.Medium, color: colors.gris300, marginTop: 10 }]}>
        Cambio
      </Text>
      <Text style={[styles.value, { fontFamily: fonts.Inter.Regular, color: colors.Griss50, lineHeight: 20 }]}>
        {item.description?.trim() ? item.description : '—'}
      </Text>
      {!!item.obs?.trim() && (
        <>
          <Text style={[styles.label, { fontFamily: fonts.Inter.Medium, color: colors.gris300, marginTop: 10 }]}>
            Observaciones
          </Text>
          <View
            style={[
              styles.obsBox,
              {
                backgroundColor: `${colors.Morado100}18`,
                borderColor: `${colors.Morado100}40`,
              },
            ]}
          >
            <Text style={[styles.obsText, { fontFamily: fonts.Inter.Regular, color: colors.Griss50 }]}>
              {item.obs}
            </Text>
          </View>
        </>
      )}
    </View>
  )

  const keyExtractor = (item: IHistorical) => `h-${item.id}`

  return (
    <View>
      <View style={[styles.legend, { borderBottomColor: `${colors.Griss50}22` }]}>
        <Text style={[styles.legendTitle, { fontFamily: fonts.Inter.SemiBold, color: colors.Morado100 }]}>
          Registro de cambios
        </Text>
        <Text style={[styles.legendSub, { fontFamily: fonts.Inter.Regular, color: colors.gris300 }]}>
          Cada entrada muestra quién hizo el cambio y el detalle con colores del tema.
        </Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={historial}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 14, color: colors.gris300, paddingVertical: 16 }}>
            No hay movimientos en el historial.
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  legend: {
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  legendTitle: {
    fontSize: 16,
  },
  legendSub: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowHeader: {
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
  },
  obsBox: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  obsText: {
    fontSize: 14,
    lineHeight: 20,
  },
})

export default HistoryEvent
