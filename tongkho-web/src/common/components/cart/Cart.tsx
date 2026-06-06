import { Image, Tooltip } from 'antd'
import { USER_PATH } from 'common/constants/paths'
import { formatPrice, openNotification, openNotificationError } from 'common/utils'
import { PRODUCT_VALUES } from 'features/customer/product/product.constants.'
import { ICartPayload, productServices } from 'features/customer/product/productApis'
import { useNavigate } from 'react-router'
import LocalStorage from 'apis/localStorage'

interface ProductData {
  id: string
  name: string
  image?: string
  price: number
  quantity: number
  product_type: keyof typeof PRODUCT_VALUES
}

function CardComponent({ data }: { data: ProductData }) {
  const navigate = useNavigate()

  const addToGuestCart = (payload: ICartPayload) => {
    const guestCart = LocalStorage.getGuestCart()
    const productNumber = Number(payload.product_number) || 1
    const productId = Number(payload.product_id)
    const size = 'l'
    const foundIndex = guestCart.findIndex((item: any) => item.product_id === productId && item.size === size)

    if (foundIndex >= 0) {
      const nextProductNumber = guestCart[foundIndex].product_number + productNumber
      const discount = nextProductNumber >= 10 ? 0.2 : 0
      guestCart[foundIndex] = {
        ...guestCart[foundIndex],
        product_number: nextProductNumber,
        total_price: Math.round(Number(data.price) * nextProductNumber * (1 - discount))
      }
    } else {
      const discount = productNumber >= 10 ? 0.2 : 0
      guestCart.push({
        id: Date.now(),
        size,
        product_id: productId,
        product_number: productNumber,
        total_price: Math.round(Number(data.price) * productNumber * (1 - discount)),
        product: data
      })
    }

    LocalStorage.setGuestCart(guestCart)
    window.dispatchEvent(new Event('cart_updated'))
  }

  const handleAddToCart = async (payload: ICartPayload, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (!LocalStorage.getToken()) {
        addToGuestCart(payload)
        openNotification('success', 'Thành công', 'Thêm sản phẩm vào giỏ hàng thành công!')
        return
      }

      const res = await productServices.addToCart(payload)
      if (res) {
        openNotification('success', 'Thành công', 'Thêm sản phẩm vào giỏ hàng thành công!')
        window.dispatchEvent(new Event('cart_updated'))
      }
    } catch (error) {
      openNotificationError(error)
    }
  }

  return (
    <div
      className='group flex flex-col bg-white rounded-xl border border-gray-100 hover:border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative h-full overflow-hidden cursor-pointer'
      onClick={() => navigate(`${USER_PATH.PRODUCT_DETAIL}/${data?.id}`)}
    >
      {/* Product Image Container */}
      <div className='relative aspect-square overflow-hidden bg-white p-3 flex items-center justify-center'>
        <Image
          preview={false}
          className='w-full h-full object-contain mix-blend-multiply transform group-hover:scale-110 transition-transform duration-700 ease-out'
          src={data.image || 'https://bizweb.dktcdn.net/100/415/697/products/ak058.png?v=1701405312903'}
          alt={data.name}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`${USER_PATH.PRODUCT_DETAIL}/${data?.id}`)
          }}
        />

        {/* Status Badge */}
        {data.quantity > 0 ? (
          <div className='absolute top-2.5 left-2.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10'>
            Sẵn hàng
          </div>
        ) : (
          <div className='absolute top-2.5 left-2.5 bg-[#ffebee] text-[#c62828] border border-[#ef9a9a] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10'>
            Hết hàng
          </div>
        )}

        {/* Hover Overlay Background */}
        <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />

        {/* Action Group */}
        {data.quantity > 0 && (
          <div className='absolute bottom-2 right-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10'>
            <Tooltip title='Thêm vào giỏ' placement='left'>
              <button
                onClick={(e) => handleAddToCart({ product_id: Number(data.id), product_number: 1 }, e)}
                className='bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95 w-9 h-9 flex items-center justify-center rounded-full shadow-[0_4px_12px_rgb(220,38,38,0.4)] transition-all duration-300'
              >
                <svg className='w-3.5 h-3.5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512' fill='currentColor'>
                  <path d='M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z' />
                </svg>
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className='p-3 flex flex-col flex-grow bg-white border-t border-gray-50'>
        <h3 className='text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1'>
          {PRODUCT_VALUES[data?.product_type]?.text || 'KIM KHÍ'}
        </h3>

        <h3
          className='text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors duration-300 mb-2 flex-grow'
          title={data?.name}
        >
          {data?.name}
        </h3>

        <div className='flex flex-wrap items-end justify-between mt-auto gap-1'>
          <div className='flex flex-col'>
            {/* Optional Original Price placeholder */}
            <span className='text-[10px] text-gray-400 line-through mb-0.5'>{formatPrice(data?.price * 1.2)} đ</span>
            <h2 className='text-[15px] font-bold text-red-600 flex items-start leading-none'>
              {formatPrice(data?.price)}
              <span className='text-[10px] font-semibold text-red-600 ml-0.5 mt-0.5 underline'>đ</span>
            </h2>
          </div>

          {/* Mobile visible add to cart button */}
          {data.quantity > 0 && (
            <button
              onClick={(e) => handleAddToCart({ product_id: Number(data.id), product_number: 1 }, e)}
              className='lg:hidden bg-red-50 text-red-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors'
            >
              <svg className='w-3 h-3' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512' fill='currentColor'>
                <path d='M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z' />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardComponent
