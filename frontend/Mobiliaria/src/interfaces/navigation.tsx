export type NavigationScreens =
    {
        Login: undefined,
        Home: {
            refresh: boolean
        },
        Inventary: undefined,
        Payments: undefined,
        Charts: undefined,
        Delivery: undefined,
        Workers: undefined,
        Package: undefined,
        ViewMore: undefined,
        /** Rutas del stack «Ver más» (MenuScreens en FooterMenu) */
        CRM: undefined,
        Estadisticas: undefined,
        GastosFinanzas: undefined,
        Clients: undefined,
        Clientes: undefined,
        Pagos: undefined,
        EventDetail: {
            id: number
        },
        Available: {
            date: string,
            id?: number
        },
        AddEvent: {
            date: string
        },
        DesignEvent: undefined
        DisenaEvento: undefined
        DesignEventResult: {
            refresh?: boolean
        }
    }