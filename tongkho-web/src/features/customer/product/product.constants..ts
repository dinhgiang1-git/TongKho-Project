export const PRODUCT_TYPES = {
  BEST_SELLER: '1',
  INVENTORY: '2',
  NEW: '3'
} as const

export const PRODUCT_VALUES = {
  [PRODUCT_TYPES.BEST_SELLER]: {
    text: 'Hàng bán chạy'
  },
  [PRODUCT_TYPES.INVENTORY]: {
    text: 'Hàng tồn kho'
  },
  [PRODUCT_TYPES.NEW]: {
    text: 'Hàng mới về'
  }
}
