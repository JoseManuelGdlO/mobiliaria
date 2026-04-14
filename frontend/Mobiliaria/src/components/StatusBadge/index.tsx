import { useTheme } from '@hooks/useTheme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'partial'
}

const statusLabel = {
  paid: 'Liquidado',
  pending: 'Pendiente',
  partial: 'Parcial',
}

const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const { colors, fonts } = useTheme()

  const styleByStatus = {
    paid: { bg: `${colors.green}22`, border: `${colors.green}66`, text: colors.green },
    pending: { bg: `${colors.red}20`, border: `${colors.red}66`, text: colors.red },
    partial: { bg: `${colors.Morado600}28`, border: `${colors.Morado100}66`, text: colors.Morado100 },
  }[status]

  return (
    <View style={[styles.badge, { backgroundColor: styleByStatus.bg, borderColor: styleByStatus.border }]}>
      <Text style={{ color: styleByStatus.text, fontFamily: fonts.Inter.SemiBold, fontSize: 11 }}>
        {statusLabel[status]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
})

export default StatusBadge
