import { AxiosClient } from '../../../apis/axiosClient'

export interface IQuery {
  page: number
}

export interface ITopProductsFilter {
  year: number
  month: number
}

export const adminDashboardServices = {
  get: () => {
    const url = '/overview'
    return AxiosClient.get(url)
  },
  getRevenueByYear: (year: number) => {
    const url = `/overview/revenue/${year}`
    return AxiosClient.get(url)
  },
  getTopProducts: (filter: ITopProductsFilter) => {
    const url = `/overview/products/top`
    return AxiosClient.get(url, {
      params: filter
    })
  }
}
