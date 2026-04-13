import React, { useMemo } from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface EmptyStateProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  style?: ViewStyle
}

const EmptyState = ({ title, subtitle, children, style }: EmptyStateProps): JSX.Element => {
  const { colors, fonts } = useTheme()
  const s = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          paddingVertical: 32,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        title: {
          fontFamily: fonts.Inter.Medium,
          fontSize: 15,
          color: colors.gris300,
          textAlign: 'center',
        },
        subtitle: {
          marginTop: 8,
          fontFamily: fonts.Inter.Regular,
          fontSize: 13,
          color: colors.gris400,
          textAlign: 'center',
        },
      }),
    [colors, fonts],
  )

  return (
    <View style={[s.wrap, style]}>
      <Text style={s.title}>{title}</Text>
      {subtitle != null && subtitle.length > 0 ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  )
}

export default EmptyState
