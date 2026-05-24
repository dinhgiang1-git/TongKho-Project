import { AxiosClient } from 'apis/axiosClient'

interface ILogin {
  username: string
  password: string
}

export const authService = {
  login: (data: ILogin) => {
    return AxiosClient.post('/auth/login', data)
  },
  getUserInfo: () => {
    return AxiosClient.get('/user')
  }
}
