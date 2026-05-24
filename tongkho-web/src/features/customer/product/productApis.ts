import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'

export interface IQuery {
  page: number
}

export interface ICartPayload {
  product_id: number | null
  product_number: number | null
}

export interface ICommentPayload {
  product_id: number
  comment: string
}
export const productServices = {
  get: (params: IQuery) => {
    const url = '/product'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  getById: (id: number) => {
    const url = `/product/${id}`
    return AxiosClient.get(url)
  },
  addToCart: (payload: ICartPayload) => {
    const url = `/cart`
    return AxiosClient.post(url, { ...payload })
  },
  comment: (payload: ICommentPayload) => {
    const url = `/product-review`
    return AxiosClient.post(url, { ...payload })
  }
}
