import { createSlice, PayloadAction } from '@reduxjs/toolkit'


type UpdateFcmToken = string

type updateRolNameAction = string

type updateGenderAction = string

const initialState: any = {
  userName: '',
  firstName: '',
  lastName: '',
  email: ''
}
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoginData: (state, action: PayloadAction<any>) => {
      if (state.simulation.active) {
        state.simulation = {
          ...state.simulation,
          user: {
            ...state.simulation.user,
            ...action.payload
          }
        }
      } else {
        return { ...state, ...action.payload }
      }
    },
    removeLoginData: (state) => initialState,
    updateFcmToken: (state, action: PayloadAction<UpdateFcmToken>) => {
      state.fcmToken = action.payload
    },
    updateRolName: (state, action: PayloadAction<updateRolNameAction>) => {
      if (state.simulation.active) {
        state.simulation.user.rolName = action.payload
      } else {
        state.rolName = action.payload
      }
    },
    updateGender: (state, action: PayloadAction<updateGenderAction>) => {
      state.gender = action.payload
      if (state.simulation.active) {
        state.simulation.user.gender = action.payload
      } else {
        state.gender = action.payload
      }
    },
    exitSimulationUser: (state) => {
      state.simulation = initialState.simulation
    }
  }
})

// Action creators are generated for each case reducer function
export default userSlice.reducer
