import { AxiosClient } from 'apis/axiosClient'
import { ISupplier } from './supplier.props'

const URL = 'a/suppliers'
export const supplierServices = {
  get: (params: any): Promise<{ data: Array<ISupplier>; meta: any }> => {
    return AxiosClient.get(URL, { params })
  },

  create: (body: any) => {
    return AxiosClient.post(URL, body)
  },

  update: (id: string, body: any) => {
    return AxiosClient.patch(`${URL}/${id}`, body)
  },
  delete: (id: string) => {
    return AxiosClient.delete(`${URL}/${id}`)
  }
}
