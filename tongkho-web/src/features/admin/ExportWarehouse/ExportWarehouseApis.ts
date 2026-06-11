import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IExportWarehouse, IPayLoadListExportWarehouse } from './ExportWarehouse.props'

export const exportWarehouseServices = {
  get: (params: IPayLoadListExportWarehouse) => {
    const url = '/warehouse/export/history'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  post: (payload: IExportWarehouse) => {
    const url = '/warehouse/export'
    return AxiosClient.post(url, {
      ...payload
    })
  }
}
