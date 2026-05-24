import { createSlice } from '@reduxjs/toolkit'

const rootSlice = createSlice({
  name: 'user',
  initialState: {
    appLoading: true,
    user: null
  },
  reducers: {
    setAppLoading: (state) => {
      state.appLoading = false
    },
    setUser: (state, action) => {
      state.user = action.payload
    }
  }
})

const { reducer: appReducer, actions } = rootSlice
export const { setAppLoading, setUser } = actions
export default appReducer
