import { IAvailability } from '@interfaces/availability'
import { IPackage } from '@interfaces/packages'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: any = {
    packages: [] as IPackage[],
    inventary: [] as IAvailability[],
    event: {},
    total: 0
}
export const userSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setInventaryRx: (state, action: PayloadAction<any>) => {
            state.inventary = action.payload
        },
        setPackagesRx: (state, action: PayloadAction<any>) => {
            state.packages = action.payload
        },
        setTotalRx: (state, action: PayloadAction<any>) => {
            state.total = action.payload
        },
        setEventRx: (state, action: PayloadAction<any>) => {
            state.event = action.payload
        },
        removeEventDataRx: (state) => initialState
    }
})

// Action creators are generated for each case reducer function
export default userSlice.reducer
