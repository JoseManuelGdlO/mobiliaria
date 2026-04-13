import React, { useMemo } from 'react'
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'
import { useTheme } from '@hooks/useTheme'

interface AppCardProps extends ViewProps {
  children: React.ReactNode
  padding?: number
  style?: ViewStyle
}

/**
 * Contenedor de tarjeta alineado con CardEvents: borde suave, sombra, fondo feedCard.
 */
const AppCard = ({ children, padding = 14, style, ...rest }: AppCardProps): JSX.Element => {
  const { colors } = useTheme()

  const cardStyle = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: 16,
          backgroundColor: colors.background_parts.feedCard,
          borderWidth: 1,
          borderColor: `${colors.Griss50}12`,
          padding,
          ...Platform.select({
            ios: {
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
          }),
        },
      }),
    [colors, padding],
  )

  return (
    <View style={[cardStyle.wrap, style]} {...rest}>
      {children}
    </View>
  )
}

export default AppCard
