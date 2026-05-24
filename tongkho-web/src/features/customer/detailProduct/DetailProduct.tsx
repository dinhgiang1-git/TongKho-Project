import { Image, InputNumber } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { productServices } from '../product/productApis'
import { formatPrice, openNotification, openNotificationError } from 'common/utils'
import CardComponent from 'common/components/cart/Cart'
import { USER_PATH } from 'common/constants/paths'
import Comment from '../comment/Comment'
import { motion } from 'framer-motion'
import { ShoppingCart, ChevronRight, Package, CheckCircle2, Home } from 'lucide-react'

function DetailProductPage() {
  const [product, setProduct] = useState<any>({})
  const [selectedImage, setSelectedImage] = useState<string>('')
  const navigate = useNavigate()
  const [relatedProducts, setRelatedProducts] = useState<Array<any>>([])
  const [payload, setPayload] = useState<any>({
    page: 1,
    take: 999,
    brand: null
  })
  const [cartPayload, setCartPayload] = useState<any>({
    size: 'l',
    product_number: 1,
    product_id: null
  })
  const { id } = useParams()

  const getProductById = useCallback(async (id: any) => {
    try {
      const res = await productServices.getById(id)
      setProduct(res?.data)
    } catch (error) {
      console.log('🚀 ~ getProductById ~ error:', error)
    }
  }, [])

  const getProductsByCategory = useCallback(async (payload: any) => {
    try {
      const res = await productServices.get(payload)
      setRelatedProducts(res?.data)
    } catch (error) {
      console.log('🚀 ~ getProductById ~ error:', error)
    }
  }, [])

  const handleRelatedProductClick = useCallback(
    (productId: string) => {
      navigate(`${USER_PATH.PRODUCT_DETAIL}/${productId}`)
    },
    [navigate]
  )

  const handleSetCartPayload = (key: any, value: any) => {
    try {
      setCartPayload((prev: any) => ({
        ...prev,
        [key]: value
      }))
    } catch (error) {
      console.log('🚀 ~ handleSetCartPayload ~ error:', error)
    }
  }
  const handleAddToCart = useCallback(async (payload: any) => {
    try {
      const res = await productServices.addToCart(payload)
      if (res) {
        openNotification('success', 'Thành công', 'Thêm sản phẩm vào giỏ hàng thành công!')
        window.dispatchEvent(new Event('cart_updated'))
      }
    } catch (error) {
      openNotificationError(error)
    }
  }, [])

  useEffect(() => {
    getProductById(id)
    window.scrollTo({
      top: 0, // Vị trí trên cùng
      behavior: 'smooth' // Cuộn mượt
    })
  }, [id, getProductById, handleRelatedProductClick])

  useEffect(() => {
    if (product?.category_id) {
      setPayload((prev: any) => ({
        ...prev,
        brand: product?.category_id
      }))
    }
  }, [product, handleRelatedProductClick])

  useEffect(() => {
    if (payload.brand) {
      getProductsByCategory(payload)
    }
  }, [payload])

  useEffect(() => {
    setCartPayload((prev: any) => ({
      ...prev,
      product_id: product?.id
    }))
  }, [product])

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image)
    }
  }, [product])

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      {/* Breadcrumb */}
      <div className='bg-white border-b border-gray-100'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center text-xs text-gray-500 gap-1'>
          <span
            className='flex items-center hover:text-primary cursor-pointer transition-colors'
            onClick={() => navigate('/')}
          >
            <Home className='w-3.5 h-3.5 mr-1' />
            Trang chủ
          </span>
          <ChevronRight className='w-3.5 h-3.5 text-gray-300' />
          <span
            className='hover:text-primary cursor-pointer transition-colors'
            onClick={() => navigate(USER_PATH.PRODUCT)}
          >
            Sản phẩm
          </span>
          <ChevronRight className='w-3.5 h-3.5 text-gray-300' />
          <span
            className='hover:text-primary cursor-pointer transition-colors'
            onClick={() => {
              if (product.category_id) navigate(USER_PATH.PRODUCT, { state: { category_id: product.category_id } })
            }}
          >
            {product.category?.name || 'Danh mục'}
          </span>
          <ChevronRight className='w-3.5 h-3.5 text-gray-300' />
          <span className='text-gray-700 font-medium truncate max-w-[200px]'>{product?.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 sm:px-6 mt-6'>
        <div className='flex flex-col lg:flex-row gap-6 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100'>
          {/* Product Images — compact */}
          <div className='w-full lg:w-[42%] flex flex-col gap-3'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center group'
              style={{ aspectRatio: '1 / 1', maxHeight: 380 }}
            >
              <Image
                width='100%'
                height='100%'
                className='object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-105'
                src={selectedImage || product.image}
                fallback='https://via.placeholder.com/500x500?text=No+Image'
                preview={false}
              />
            </motion.div>

            {/* Thumbnail strip */}
            <div className='flex gap-2 overflow-x-auto pb-1'>
              {product.product_photo?.map((p: any, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.04 }}
                  className={`flex-shrink-0 w-16 h-16 cursor-pointer rounded-lg overflow-hidden border-2 transition-all bg-white flex items-center justify-center
                    ${selectedImage === p.url ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100 hover:border-gray-300'}`}
                  onClick={() => setSelectedImage(p.url)}
                >
                  <Image
                    width='100%'
                    height='100%'
                    className='object-contain mix-blend-multiply p-1.5'
                    src={p?.url}
                    preview={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product Info — refined typography */}
          <div className='w-full lg:w-[58%] flex flex-col'>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className='flex-1 flex flex-col'
            >
              {/* Badges */}
              <div className='flex flex-wrap gap-2 mb-3'>
                <span className='inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md'>
                  <Package className='w-3.5 h-3.5' />
                  {product?.product_code || '—'}
                </span>
                <span className='inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md'>
                  <CheckCircle2 className='w-3.5 h-3.5' />
                  Còn hàng
                </span>
              </div>

              {/* Product Name */}
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-1'>{product?.name}</h1>
              <p className='text-xs text-gray-400 mb-4'>{product.category?.name}</p>

              {/* Price */}
              <div className='flex items-baseline gap-1.5 py-3 px-4 bg-blue-50 rounded-xl border border-blue-100 mb-5 w-fit'>
                <span className='text-2xl sm:text-3xl font-extrabold text-primary leading-none'>
                  {formatPrice(product.price)}
                </span>
                <span className='text-base font-semibold text-primary underline underline-offset-2'>đ</span>
              </div>

              {/* Description */}
              <div className='mb-5'>
                <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <div className='w-1 h-3.5 bg-primary rounded-full' />
                  Mô tả sản phẩm
                </h3>
                <p className='text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[80px]'>
                  {product.introduce || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>

              {/* Quantity + Add to cart */}
              <div className='mt-auto pt-4 border-t border-gray-100'>
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                  <div className='flex flex-col gap-1 sm:w-32'>
                    <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Số lượng</label>
                    <InputNumber
                      min={1}
                      max={999}
                      defaultValue={1}
                      size='middle'
                      className='w-full !rounded-lg !border-gray-200'
                      onChange={(value) => handleSetCartPayload('product_number', value)}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(cartPayload)}
                    className='flex-1 mt-auto py-2.5 px-5 rounded-xl bg-primary hover:bg-hover text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                  >
                    <ShoppingCart className='w-4 h-4' />
                    Thêm vào giỏ hàng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        <div className='mt-12'>
          <div className='flex items-center gap-2.5 mb-5'>
            <div className='w-1.5 h-6 bg-primary rounded-full' />
            <h2 className='text-lg font-bold text-gray-900'>Sản phẩm liên quan</h2>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4'>
            {relatedProducts && relatedProducts.length > 0 ? (
              relatedProducts.slice(0, 5).map((item: any, index: number) => <CardComponent key={index} data={item} />)
            ) : (
              <div className='col-span-full text-center py-10 text-gray-400 text-sm'>Đang tải sản phẩm...</div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className='mt-10 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100'>
          <Comment id={id} reviews={product.product_reviews} getProduct={getProductById} />
        </div>
      </div>
    </div>
  )
}

export default DetailProductPage
