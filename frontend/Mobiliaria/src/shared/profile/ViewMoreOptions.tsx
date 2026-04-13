import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useTheme } from '@hooks/useTheme'

export interface Option {
    name: string
    icon?: JSX.Element
    navigate?: string
    customAction?: () => void
    params?: object
    modalRef?: any
}

const ICON_SIZE = 26

/**
 * Opciones del menú «Ver más» con iconos Material (misma línea visual que el resto de la app).
 */
export const useViewMoreMenuOptions = (): Option[] => {
    const { colors } = useTheme()
    const c = colors.Morado100

    const options: Option[] = [
        {
            name: 'Estadísticas',
            icon: <MaterialCommunityIcons name="chart-timeline-variant" size={ICON_SIZE} color={c} />,
            navigate: 'Estadisticas',
        },
        {
            name: 'Clientes',
            icon: <MaterialCommunityIcons name="account-group-outline" size={ICON_SIZE} color={c} />,
            navigate: 'Clientes',
        },
        {
            name: 'Seguimiento a pagos',
            icon: <MaterialCommunityIcons name="credit-card-outline" size={ICON_SIZE} color={c} />,
            navigate: 'Pagos',
        },
        {
            name: 'Diseña tu evento',
            icon: <MaterialCommunityIcons name="palette-outline" size={ICON_SIZE} color={c} />,
            navigate: 'DisenaEvento',
        },
    ]

    return options
}
