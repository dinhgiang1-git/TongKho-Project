/* eslint-disable no-useless-escape */
import { notification } from 'antd'
import Config from './constants/config'
import { cloneDeep } from 'lodash'
import { ORDER_STATUS } from './constants/constants'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

export const openNotification = (type: NotificationType, title: string, desc: string) => {
  notification[type]({
    message: title,
    description: desc
  })
}

export const openNotificationError = (err: any) => {
  if (err) {
    notification['error']({
      message: 'Có lỗi',
      description: err.response.data.message
    })
  }
}

export const handleObjectEmpty = (obj: any) => {
  const cloneObj = cloneDeep(obj)
  // remove key from object value empty
  for (const key in cloneObj) {
    if (Object.prototype.hasOwnProperty.call(cloneObj, key)) {
      const element = cloneObj[key]
      if (element === '' || element === null) delete cloneObj[key]
    }
  }
  return cloneObj
}

export function formatDate(value: any) {
  const date = new Date(value) // Chuyển chuỗi ISO thành đối tượng Date
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Tháng bắt đầu từ 0
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const getDataSource = (data: any, page: number) => {
  return data.map((value: any, index: number) => {
    return {
      ...value,
      key: value.id,
      STT: Config.getIndexTable(page, index),
      textStatus: value.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động',
      status: value.status == 1 ? 'Đang hoạt động' : 'Ngừng hoạt động',
      s: value.status,
      createdAt: formatDate(value.created_at),
      category: value?.category?.name
    }
  })
}

export const vldOrderStatus = (value: string) => {
  if (!value || !ORDER_STATUS[value]) {
    return 'Không xác định'
  }
  return ORDER_STATUS[value].text
}

export function formatPrice(num: string | any, type?: 'VND' | '$') {
  const tmpType = type || ''
  if (num === null || num === undefined || num === '0' || Number.isNaN(parseFloat(num))) return ''
  const result = num.toString().replace(/,/g, '')
  return `${
    result
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      .replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|' '|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '') + tmpType
  }`
}

export const timeSince = (date: Date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  let interval = Math.floor(seconds / 31536000)

  if (interval >= 1) return `${interval} năm trước`

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return `${interval} tháng trước`

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return `${interval} ngày trước`

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return `${interval} giờ trước`

  interval = Math.floor(seconds / 60)
  if (interval >= 1) return `${interval} phút trước`

  return 'vừa xong'
}

export const getOptionListSelector = (data: Array<any>, labelKey: string, valueKey: string) => {
  return data.map((item) => ({
    label: item[labelKey], // Gán label từ key tương ứng
    value: item[valueKey] // Gán value từ key tương ứng
  }))
}
