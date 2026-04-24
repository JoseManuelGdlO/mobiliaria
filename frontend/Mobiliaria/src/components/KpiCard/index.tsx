import AppCard from '@components/AppCard'
import { useTheme } from '@hooks/useTheme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useLayoutMetrics } from '@theme/layout'

interface KpiCardProps {
  label: string
  value: string
  hint?: string
}

const KpiCard = ({ label, value, hint }: KpiCardProps): JSX.Element => {
  const { colors, fonts } = useTheme()
  const { isTablet } = useLayoutMetrics()
  return (
    <AppCard style={[styles.card, isTablet && styles.cardTablet]}>
      <Text style={{ color: colors.gris300, fontFamily: fonts.Inter.Regular, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.Morado100, fontFamily: fonts.Inter.SemiBold, fontSize: 17, marginTop: 5 }}>{value}</Text>
      {hint != null && hint.length > 0 ? (
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: colors.gris400, fontFamily: fonts.Inter.Regular, fontSize: 11 }}>{hint}</Text>
        </View>
      ) : null}
    </AppCard>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 10,
  },
  cardTablet: {
    width: '31.5%',
  },
})

export default KpiCard
