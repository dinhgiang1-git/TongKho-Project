import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IPayLoadListWarehouseHistory } from './WarehouseHistory.props'

export const warehouseHistoryServices = {
  get: (params: IPayLoadListWarehouseHistory) => {
    const url = '/a/warehouse-history'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  }
}
