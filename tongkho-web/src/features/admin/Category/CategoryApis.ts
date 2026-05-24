import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { ICategory, IPayLoadLisCategory } from './Category.props'

export const categoryServices = {
  get: (params: IPayLoadLisCategory) => {
    console.log('🚀 ~ params:', params)
    const url = '/a/category'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  post: (payload: ICategory) => {
    const url = '/a/category'
    return AxiosClient.post(url, {
      ...payload
    })
  },
  patch: (value: any) => {
    const url = `/a/category/${value?.id}`
    return AxiosClient.patch(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/a/category/${id}`
    return AxiosClient.delete(url)
  }
}
