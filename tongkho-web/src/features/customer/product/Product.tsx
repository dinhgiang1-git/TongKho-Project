import React, { useCallback, useEffect, useState } from 'react'
import { Spin, Pagination } from 'antd'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { productServices } from './productApis'
import CardComponent from 'common/components/cart/Cart'
import { formatPrice } from 'common/utils'
import { homeServices } from '../home/homeApis'
import { PRODUCT_VALUES } from './product.constants.'
import NodataComponent from 'common/components/Nodata/NoData'
import { useLocation } from 'react-router'

const productPriceListOptions = [
  { label: `< ${formatPrice(200000)}`, range: [0, 200000] },
  { label: `${formatPrice(200000)} - ${formatPrice(500000)}`, range: [200000, 500000] },
  { label: `${formatPrice(500000)} - ${formatPrice(700000)}`, range: [500000, 700000] },
  { label: `${formatPrice(700000)} - ${formatPrice(1000000)}`, range: [700000, 1000000] },
  { label: `> ${formatPrice(1000000)}`, range: [1000000, Infinity] }
]

function ProductPage() {
  const [isProductTypesOpen, setIsProductTypesOpen] = useState<boolean>(true)
  const [isProductPriceOpen, setIsPriceOpen] = useState<boolean>(true)
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [products, setProducts] = useState<any>([])
  const [categories, setCategories] = useState<Array<any>>([])
  const [itemCount, setItemCount] = useState<number>(0)
  const [categoryId, setCategoryId] = useState<number>(null)
  const location = useLocation()
  const { state } = location || {}
  const brand = state?.category_id || {}
  const [payload, setPayload] = useState<any>({
    page: 1,
    take: 20,
    q: '',
    to_date: '',
    from_date: '',
    status: null,
    price_range: null,
    brand: null,
    product_type: null
  })

  const handleGetProduct = useCallback(async (payload: any) => {
    try {
      setIsLoading(true)
      const res = await productServices.get(payload)
      setItemCount(res.meta.item_count)
      setProducts(res?.data)
      setIsLoading(false)
    } catch (error) {
      console.error('🚀 ~ handleGetProduct ~ error:', error)
      setIsLoading(false)
    }
  }, [])

  const handleGetcategory = useCallback(async () => {
    try {
      const res = await homeServices.getCategory()
      setCategories(res?.data)
    } catch (error) {
      console.error('🚀 ~ handleGetcategory ~ error:', error)
    }
  }, [payload])

  const productTypeListOptions = Object.entries(PRODUCT_VALUES).map(([value, { text }]) => ({
    label: text,
    value
  }))

  const toggleMenu = (key: string) => {
    switch (key) {
      case 'status':
        setIsProductTypesOpen(!isProductTypesOpen)
        break
      case 'price':
        setIsPriceOpen(!isProductPriceOpen)
        break
      case 'category':
        setIsCategoryOpen(!isCategoryOpen)
        break
      default:
        break
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'product_type') {
      setPayload((prev: any) => ({
        ...prev,
        page: 1,
        [key]: prev[key] === value ? null : value
      }))
    } else if (key === 'price_range') {
      setPayload((prev: any) => ({
        ...prev,
        page: 1,
        [key]: value
      }))
    } else if (key === 'category' || key === 'brand') {
      setPayload((prev: any) => ({
        ...prev,
        page: 1,
        brand: prev.brand === value ? null : value
      }))
    } else if (key === 'page') {
      setPayload((prev: any) => ({
        ...prev,
        [key]: value
      }))
    }
  }

  useEffect(() => {
    if (categoryId) {
      const updatedPayload = {
        ...payload,
        brand: categoryId
      }
      setPayload(updatedPayload)
      handleGetProduct(updatedPayload)
    }
  }, [categoryId])

  useEffect(() => {
    handleGetProduct(payload)
  }, [payload])

  useEffect(() => {
    handleGetcategory()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    setCategoryId(brand)
  }, [])

  return (
    <div className='bg-gray-50 min-h-screen pt-8 pb-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200'>
          <div>
            <h1 className='text-2xl font-bold md:text-3xl font-black text-gray-900 uppercase tracking-tight'>
              Tất cả sản phẩm
            </h1>
            <p className='mt-2 text-sm text-gray-500'>Khám phá hàng ngàn sản phẩm chất lượng cao với giá ưu đãi</p>
          </div>
          <div className='mt-4 md:mt-0 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm'>
            Đang hiển thị <span className='text-red-600 font-bold'>{products.length}</span> trên{' '}
            <span className='text-red-600 font-bold'>{itemCount}</span> sản phẩm
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar Filter */}
          <div className='w-full lg:w-1/4 xl:w-1/5 flex-shrink-0'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-50 p-6 sticky top-24'>
              <div className='flex items-center gap-2 mb-6 pb-4 border-b border-gray-100'>
                <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                  />
                </svg>
                <h2 className='text-lg font-bold text-gray-800 uppercase tracking-wide'>Bộ lọc tìm kiếm</h2>
              </div>

              {/* Loại sản phẩm (Danh mục) */}
              <div className='mb-6'>
                <h3
                  onClick={() => toggleMenu('category')}
                  className='uppercase cursor-pointer flex items-center justify-between py-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors'
                >
                  <span>Danh mục</span>
                  <span className='text-gray-400'>
                    {isCategoryOpen ? <SlArrowUp className='w-3 h-3' /> : <SlArrowDown className='w-3 h-3' />}
                  </span>
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isCategoryOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                >
                  <ul className='space-y-1'>
                    {categories.map((c, index) => {
                      const isActive = payload.brand === c.id
                      return (
                        <li
                          key={index}
                          className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all flex items-center gap-2 ${isActive ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'}`}
                          onClick={() => handleFilterChange('brand', c.id)}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-transparent group-hover:bg-red-300'}`}
                          ></div>
                          {c.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              <div className='h-px bg-gray-50 w-full my-4'></div>

              {/* Mức giá */}
              <div className='mb-6'>
                <h3
                  onClick={() => toggleMenu('price')}
                  className='uppercase cursor-pointer flex items-center justify-between py-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors'
                >
                  <span>Mức giá</span>
                  <span className='text-gray-400'>
                    {isProductPriceOpen ? <SlArrowUp className='w-3 h-3' /> : <SlArrowDown className='w-3 h-3' />}
                  </span>
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isProductPriceOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                >
                  <ul className='space-y-1'>
                    {productPriceListOptions.map((p, index) => {
                      const isActive = payload.price_range === p.range
                      return (
                        <li
                          key={index}
                          className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all flex items-center gap-2 ${isActive ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'}`}
                          onClick={() => handleFilterChange('price_range', p?.range)}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-transparent'}`}
                          ></div>
                          {p?.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              <div className='h-px bg-gray-50 w-full my-4'></div>

              {/* Trạng thái */}
              <div>
                <h3
                  onClick={() => toggleMenu('status')}
                  className='uppercase cursor-pointer flex items-center justify-between py-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors'
                >
                  <span>Trạng thái</span>
                  <span className='text-gray-400'>
                    {isProductTypesOpen ? <SlArrowUp className='w-3 h-3' /> : <SlArrowDown className='w-3 h-3' />}
                  </span>
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isProductTypesOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                >
                  <ul className='space-y-1'>
                    {productTypeListOptions.map((p, index) => {
                      const isActive = payload.product_type === p.value
                      return (
                        <li
                          key={index}
                          className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all flex items-center gap-2 ${isActive ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'}`}
                          onClick={() => handleFilterChange('product_type', p.value)}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-transparent'}`}
                          ></div>
                          {p.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className='flex-1 w-full'>
            {products && products.length ? (
              <Spin wrapperClassName='wrapper-spin' spinning={isLoading}>
                <div className='bg-transparent h-full'>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {products.map((item: any, index: number) => (
                      <CardComponent key={index} data={item} />
                    ))}
                  </div>

                  {itemCount > 0 && (
                    <div className='flex justify-center mt-12 mb-4 bg-white py-4 rounded-2xl shadow-sm border border-gray-50'>
                      <Pagination
                        className='ant-pagination-custom'
                        current={payload.page}
                        total={itemCount}
                        defaultPageSize={payload.take}
                        onChange={(page) => {
                          handleFilterChange('page', page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      />
                    </div>
                  )}
                </div>
              </Spin>
            ) : (
              !isLoading && (
                <div className='bg-white rounded-2xl border border-gray-50 p-12 h-full min-h-[400px] flex items-center justify-center shadow-sm'>
                  <NodataComponent />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
