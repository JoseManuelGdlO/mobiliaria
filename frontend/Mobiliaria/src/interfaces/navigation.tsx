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
        Clientes: undefined,
        Pagos: undefined,
        Estadisticas: undefined,
        Clients: undefined,
        EventDetail: {
            id: number
        },
        Available: {
            date: string,
            id?: number
        },
        AddEvent: {
            date: string
        }
    }