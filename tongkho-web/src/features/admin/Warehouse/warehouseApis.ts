import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IWarehouse, IPayLoadLisWarehouse } from './Warehouse.props'

export const warehouseServices = {
  get: (params: IPayLoadLisWarehouse) => {
    const url = '/a/warehouse'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  post: (payload: IWarehouse) => {
    const url = '/a/warehouse'
    return AxiosClient.post(url, {
      ...payload
    })
  },
  patch: (value: any) => {
    const url = `/a/warehouse/${value?.id}`
    return AxiosClient.patch(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/a/warehouse/${id}`
    return AxiosClient.delete(url)
  },
  getInventory: (warehouseId: number) => {
    const url = `/a/warehouse/${warehouseId}/inventory`
    return AxiosClient.get(url)
  }
}
