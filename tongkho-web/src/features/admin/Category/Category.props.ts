export interface ICategory {
  id?: number
  name: string
  status: string
}

export interface IPayLoadLisCategory {
  page?: number
  take?: number
  q?: string
  status?: number | null
  from_date?: string
  to_date?: string
}
