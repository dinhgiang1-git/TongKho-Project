import { AxiosClient } from '../../../apis/axiosClient'

export const cartServices = {
  get: () => {
    const url = '/cart'
    return AxiosClient.get(url)
  },
  delete: (cartId: number) => {
    const url = '/cart'
    return AxiosClient.delete(`${url}/${cartId}`)
  },
  update: (cartId: string, payload: any) => {
    const url = '/cart'
    return AxiosClient.put(`${url}/${cartId}`, { ...payload })
  }
}
