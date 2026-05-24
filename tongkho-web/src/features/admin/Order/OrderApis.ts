import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'

export interface IQuery {
  page: number
}

export const orderServices = {
  get: (params: IQuery) => {
    const url = '/a/order'
    const handleParams = handleObjectEmpty(params)
    console.log('🚀 ~ handleParams:', handleParams)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE, order_status: handleParams.status }
    })
  },
  getById: (id: any) => {
    const url = `/a/order/${id}`
    return AxiosClient.get(url)
  },
  nextStep: (id: any) => {
    const url = `/a/order/trigerWorkFlow/${id}`
    return AxiosClient.post(url)
  },
  put: (value: any) => {
    const url = `/a/order/${value?.id}`
    return AxiosClient.put(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/a/order/${id}`
    return AxiosClient.delete(url)
  },
  export: (value: IQuery) => {
    const url = '/a/order/export'
    const handleParams = handleObjectEmpty(value)
    return AxiosClient.post(url, {
      ...handleParams,
      limit: RECORD_SIZE
    })
  }
}
