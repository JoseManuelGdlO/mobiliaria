export type NavigationScreens =
    {
        Login: undefined,
        Home: {
            refresh: boolean
        },
        Inventary: undefined,
        Payments: undefined,
        Workers: undefined,
        ViewMore: undefined,
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