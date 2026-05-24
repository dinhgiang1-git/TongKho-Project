import { AxiosClient } from '../../../apis/axiosClient'

export const accountServices = {
  put: (id: string, value: any) => {
    console.log('🚀 ~ value:', value)
    const url = `/user/${id}`
    return AxiosClient.patch(url, {
      ...value
    })
  },
  register: (payload: any) => {
    const url = `/user/register`
    return AxiosClient.post(url, { ...payload })
  }
}
