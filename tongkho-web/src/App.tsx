import React, { useEffect } from 'react'
import './styles/index.css'
import AppNavigator from 'navigation'
import { openNotificationError } from 'common/utils'
import { authService } from 'features/customer/auth/service/Apis'
import { useDispatch } from 'react-redux'
import { setLogin } from 'redux/slice/login.slice'
import LocalStorage from 'apis/localStorage'

function App() {
  const dispatch = useDispatch()
  const token = LocalStorage.getToken()
  const getUserInfo = async () => {
    try {
      const res = await authService.getUserInfo()
      if (res) {
        dispatch(setLogin(res?.data))
      }
    } catch (error) {
      openNotificationError(error)
    }
  }

  useEffect(() => {
    if (token) {
      getUserInfo()
    }
  }, [])
  return (
    <React.Fragment>
      <AppNavigator />
    </React.Fragment>
  )
}

export default App
