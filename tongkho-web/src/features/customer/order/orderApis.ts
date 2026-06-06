import { AxiosClient } from 'apis/axiosClient'
import axios from 'axios'

export interface IQuery {
  query: string
}

export const orderServices = {
  getProvince: async () => {
    try {
      const url = 'https://provinces.open-api.vn/api/v1/p/'
      const response = await axios.get(url)
      // Map code to id as string and wrap in data to match Order.tsx expectation
      const data = (response.data || []).map((p: any) => ({
        ...p,
        id: p.code ? String(p.code) : ''
      }))
      return { data }
    } catch (error) {
      console.error('Error fetching provinces:', error)
      throw error // Ném lỗi ra ngoài để xử lý
    }
  },
  getDistrict: async (provinceId: string) => {
    try {
      if (!provinceId) return { data: [] }
      const url = `https://provinces.open-api.vn/api/v1/p/${provinceId}?depth=2`
      const response = await axios.get(url)
      // Map code to id as string and return districts array
      const data = (response.data?.districts || []).map((d: any) => ({
        ...d,
        id: d.code ? String(d.code) : ''
      }))
      return { data }
    } catch (error) {
      console.error('Error fetching districts:', error)
      throw error // Ném lỗi ra ngoài để xử lý
    }
  },
  getWards: async (districtId: string) => {
    try {
      if (!districtId) return { data: [] }
      const url = `https://provinces.open-api.vn/api/v1/d/${districtId}?depth=2`
      const response = await axios.get(url)
      // Map code to id as string and return wards array
      const data = (response.data?.wards || []).map((w: any) => ({
        ...w,
        id: w.code ? String(w.code) : ''
      }))
      return { data }
    } catch (error) {
      console.error('Error fetching wards:', error)
      throw error // Ném lỗi ra ngoài để xử lý
    }
  },
  createOrder: (payload: any) => {
    const url = `/order`
    return AxiosClient.post(url, { ...payload })
  },
  getOrders: (payload: any) => {
    const url = `/order`
    return AxiosClient.get(url, { ...payload })
  },
  downloadInvoice: (id: number, phone?: string) => {
    const url = `/order/${id}/invoice`
    return AxiosClient.get(url, {
      params: { phone },
      responseType: 'blob'
    }) as Promise<Blob>
  },
  cancelOrder: (id: number) => {
    const url = `/order/cancel/${id}`
    return AxiosClient.patch(url)
  }
}
