export interface IProduct {
  id?: string
  name: string
  category_id: number
  price: number
  product_type: number
  availability?: number
  status?: number
  number_of_review?: number
  quantity?: number
  sold?: number
  description: string
  image: string
  images: string
  product_photo: []
  introduce: string
  product_code?: string
}

export interface IPayLoadLisCategory {
  page?: number
  limit?: number
  q?: string
  status?: number
  from_date?: string
  to_date?: string
  category_id?: number
  product_type?: number
}
