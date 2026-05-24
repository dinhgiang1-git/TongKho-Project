export interface IPayLoadListCustomer {
  page?: number
  limit?: number
  q?: string
  status?: string
  from_date?: string
  to_date?: string
}

export interface IAccount {
  id?: string | null
  name: string
  phone: string
  email: string
  password?: string
  avatar?: string
  status: string
  textStatus?: string
}
