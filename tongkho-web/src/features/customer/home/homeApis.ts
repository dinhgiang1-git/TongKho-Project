import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IBlog } from './Blog.props'

export interface IQuery {
  page: number
}

export const homeServices = {
  getCategory: (params?: IQuery) => {
    const url = '/category'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  post: (value: IBlog) => {
    const url = '/product'
    return AxiosClient.post(url, {
      ...value
    })
  },
  put: (value: IBlog) => {
    console.log('🚀 ~ value:', value)
    const url = `/product/${value?.id}`
    return AxiosClient.patch(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/product/${id}`
    return AxiosClient.delete(url)
  }
}
