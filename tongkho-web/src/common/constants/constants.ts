export const TEXT_CONSTANTS = {
  IS_NOT_EMPTY: 'Không được để trống'
}

export enum CommonStatus {
  ACTIVE = 1,
  INACTIVE = 2
}

export const ORDER_TYPE = {
  PENDING: '1',
  PROCESSING: '2',
  WAITING_FOR_PAYMENT: '3',
  PAID: '4',
  CANCELED: '5'
}

export const ORDER_STATUS = {
  [ORDER_TYPE.PENDING]: {
    text: 'Chờ phê duyệt'
  },
  [ORDER_TYPE.PROCESSING]: {
    text: 'Đang chuẩn bị hàng'
  },
  [ORDER_TYPE.WAITING_FOR_PAYMENT]: {
    text: 'Đang vận chuyển'
  },
  [ORDER_TYPE.PAID]: {
    text: 'Đã giao hàng'
  },
  [ORDER_TYPE.CANCELED]: {
    text: 'Đã hủy'
  }
}
