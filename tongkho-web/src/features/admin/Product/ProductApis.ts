import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IProduct } from './Product.props'

export interface IQuery {
  page: number
  take?: number
}

export const productServices = {
  get: (params: IQuery) => {
    const url = '/a/product'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { limit: RECORD_SIZE, ...handleParams }
    })
  },
  post: (value: IProduct) => {
    const url = '/a/product'
    return AxiosClient.post(url, {
      ...value
    })
  },
  put: (value: IProduct) => {
    const url = `/a/product/${value?.id}`
    return AxiosClient.put(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/a/product/${id}`
    return AxiosClient.delete(url)
  },
  export: (value: IQuery) => {
    console.log('🚀 ~ value:', value)
    const url = '/a/product/export'
    const handleParams = handleObjectEmpty(value)
    return AxiosClient.post(url, {
      ...handleParams,
      limit: RECORD_SIZE
    })
  }
}
