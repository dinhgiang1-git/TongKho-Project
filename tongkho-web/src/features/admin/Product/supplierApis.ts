import { AxiosClient } from '../../../apis/axiosClient'

export const supplierServices = {
  get: (params?: any) => {
    return AxiosClient.get('/a/suppliers', { params })
  }
}
