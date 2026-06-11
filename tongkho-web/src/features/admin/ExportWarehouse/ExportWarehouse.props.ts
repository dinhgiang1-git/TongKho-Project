export interface IExportWarehouse {
  id?: number
  staff_name: string
  export_date: string
  products: IExportProduct[]
  status?: string
}

export interface IExportProduct {
  product_id: number
  product_name: string
  quantity: number
  note: string
  available_quantity?: number
}

export interface IPayLoadListExportWarehouse {
  page: number
  limit: number
  total?: number
}
