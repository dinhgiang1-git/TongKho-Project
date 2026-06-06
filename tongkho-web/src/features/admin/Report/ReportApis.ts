import { AxiosClient } from '../../../apis/axiosClient'

export interface ISalesReportFilter {
  filter_type?: 'all' | 'custom'
  from_date?: string
  to_date?: string
  limit?: number
}

export const reportServices = {
  getSalesReport: (filter: ISalesReportFilter) => {
    const url = '/overview/reports/sales'
    return AxiosClient.get(url, {
      params: filter
    })
  }
}
