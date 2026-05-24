export interface IWarehouseHistory {
  id?: number
  product_name: string
  quantity: number
  import_date: string
  warehouse_name: string
  status: string
  created_by: string
}

export interface IPayLoadListWarehouseHistory {
  page?: number
  take?: number
  q?: string
  status?: number
  from_date?: string
  to_date?: string
  warehouse_id?: number
}
