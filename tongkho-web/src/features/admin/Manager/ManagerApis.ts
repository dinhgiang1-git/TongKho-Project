import { handleObjectEmpty } from 'common/utils'
import { AxiosClient } from '../../../apis/axiosClient'
import { RECORD_SIZE } from 'common/config'
import { IAccount } from './Manager.props'

export interface IQuery {
  page: number
}

export const accountServices = {
  get: (params: IQuery) => {
    const url = '/admin'
    const handleParams = handleObjectEmpty(params)
    return AxiosClient.get(url, {
      params: { ...handleParams, limit: RECORD_SIZE }
    })
  },
  post: (value: IAccount) => {
    const url = '/admin'
    return AxiosClient.post(url, {
      ...value
    })
  },
  put: (value: IAccount) => {
    const url = `/admin/${value?.id}`
    return AxiosClient.put(url, {
      ...value
    })
  },
  delete: (id: number) => {
    const url = `/admin/${id}`
    return AxiosClient.delete(url)
  }
}
