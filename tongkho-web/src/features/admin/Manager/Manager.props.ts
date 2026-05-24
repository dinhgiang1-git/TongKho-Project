export interface IDataAccount {
  username?: string
  phone?: string
  name?: string
  email?: string
  password?: string
  avatar?: string
}

export interface IAccount {
  id?: string | null
  name: string
  username?: string
  phone: string
  email: string
  password?: string
  avatar?: string
  status: string
  s?: string
  role?: string
}
export interface IPayLoadListUser {
  page?: number
  take?: number
  q?: string
  status?: string
  from_date?: string
  to_date?: string
}
