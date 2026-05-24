export interface IBlog {
  id?: string
  title: string
  blog_photo: string
  content?: string
  to_date?: string
}

export interface IDataBlog {
  phone?: string
  name?: string
  email?: string
  password?: string
  avatar?: string
}

export interface IPayLoadListBlog {
  page?: number
  limit?: number
  q?: string
  status?: string
  from_date?: string
  to_date?: string
}

export interface ISupplier {
  id?: string
  supplier_code: string
  supplier_name: string
  phone?: string
  email?: string
  createdAt?: string
}
