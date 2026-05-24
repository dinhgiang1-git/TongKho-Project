import { createSlice } from '@reduxjs/toolkit'

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    login: true,
    user: {}
  },
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload
    }
  }
})

const { reducer: loginReducer, actions } = loginSlice
export const { setLogin } = actions
export default loginReducer
