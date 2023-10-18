import { createSlice, PayloadAction } from '@reduxjs/toolkit'


type UpdateFcmToken = string

const initialState: any = {
  data: {},
  token: '',
  remember: false
}
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoginData: (state, action: PayloadAction<any>) => {
      state.data = action.payload
    },
    removeLoginData: (state) => initialState,
    updateToken: (state, action: PayloadAction<UpdateFcmToken>) => {
      state.token = action.payload
    },
    rememberUser: (state, action: PayloadAction<boolean>) => {
      state.remember = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export default userSlice.reducer
