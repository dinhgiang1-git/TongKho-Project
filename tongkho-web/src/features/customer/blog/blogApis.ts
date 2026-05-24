import { AxiosClient } from '../../../apis/axiosClient'

export const blogServices = {
  get: () => {
    const url = '/blog'
    return AxiosClient.get(url)
  },
  getById: (id: string) => {
    const url = `/blog/${id}`
    return AxiosClient.get(url)
  }
}
