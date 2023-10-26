export type NavigationScreens =
    {
        Login: undefined,
        Home: undefined,
        Inventary: undefined,
        Payments: undefined,
        Workers: undefined,
        ViewMore: undefined,
        Clients: undefined,
        EventDetail: {
            id: number
        },
        Available: {
            date: string
        },
        AddEvent: {
            date: string
        }
    }