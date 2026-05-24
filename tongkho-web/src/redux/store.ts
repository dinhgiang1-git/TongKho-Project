import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slice/root.slice'
import loginReducer from './slice/login.slice'
const rootReducer = {
  root: appReducer,
  login: loginReducer
}

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
