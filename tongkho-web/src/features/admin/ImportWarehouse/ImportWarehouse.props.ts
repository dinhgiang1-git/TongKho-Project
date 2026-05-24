export interface IImportWarehouse {
  id: number
  staff_name: string
  import_date: string
  products: IImportProduct[]
  status: string
}

export interface IImportProduct {
  product_id: number
  product_name: string
  quantity: number
  note: string
}

export interface IPayLoadListImportWarehouse {
  page: number
  limit: number
  total?: number
}
