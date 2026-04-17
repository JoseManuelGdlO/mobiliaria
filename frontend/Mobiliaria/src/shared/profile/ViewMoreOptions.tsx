import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useTheme } from '@hooks/useTheme'
import useReduxUser from '@hooks/useReduxUser'
import { canAccess } from '@utils/permissions'

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
    const { user } = useReduxUser()
    const c = colors.Morado100

    const options: Option[] = [
        {
            name: 'Estadísticas',
            icon: <MaterialCommunityIcons name="chart-timeline-variant" size={ICON_SIZE} color={c} />,
            navigate: 'Estadisticas',
        },
        {
            name: 'CRM Clientes y pagos',
            icon: <MaterialCommunityIcons name="account-group-outline" size={ICON_SIZE} color={c} />,
            navigate: 'CRM',
        },
        {
            name: 'Diseña tu evento',
            icon: <MaterialCommunityIcons name="palette-outline" size={ICON_SIZE} color={c} />,
            navigate: 'DisenaEvento',
        },
        {
            name: 'Gastos y Finanzas',
            icon: <MaterialCommunityIcons name="cash-multiple" size={ICON_SIZE} color={c} />,
            navigate: 'GastosFinanzas',
        },
        {
            name: 'Planeación de rutas',
            icon: <MaterialCommunityIcons name="truck-delivery-outline" size={ICON_SIZE} color={c} />,
            navigate: 'PlaneacionRutas',
        },
    ]

    return options.filter((option) => {
        if (option.navigate === 'Estadisticas') return canAccess(user?.rol_usuario, 'statistics')
        if (option.navigate === 'GastosFinanzas') return canAccess(user?.rol_usuario, 'finance')
        if (option.navigate === 'PlaneacionRutas') return canAccess(user?.rol_usuario, 'workers')
        return true
    })
}
