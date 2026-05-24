/* eslint-disable @typescript-eslint/no-unused-vars */
import { Select, Empty, InputNumber } from 'antd'
import CustomButton from 'common/components/button/Button'
import { formatPrice, openNotification, openNotificationError } from 'common/utils'
import { useCallback, useEffect, useState } from 'react'
import { cartServices } from './cartApis'
import { useNavigate } from 'react-router'
import { USER_PATH } from 'common/constants/paths'
import { Trash2, ShoppingBag, ChevronRight, Home } from 'lucide-react'

function CartPage() {
  const navigate = useNavigate()
  const [cartId, setCartId] = useState<number>()
  const [carts, setCarts] = useState<any>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [cartPayload, setCartPayload] = useState<any>({})

  const handleGetAllCart = useCallback(async () => {
    try {
      const res = await cartServices.get()
      if (res) {
        setCarts(res?.data)
      }
    } catch (error) {
      openNotificationError(error)
    }
  }, [])

  const handleDeleteCart = useCallback(
    async (cartId: number) => {
      try {
        const res = await cartServices.delete(cartId)
        if (res) {
          openNotification('success', 'Thành công', 'Xóa sản phẩm trong giỏ hàng thành công!')
          handleGetAllCart()
          window.dispatchEvent(new Event('cart_updated'))
        }
      } catch (error) {
        openNotificationError(error)
      }
    },
    [handleGetAllCart]
  )

  const handleCalculateTheTotalAmount = useCallback(() => {
    try {
      if (carts && carts.length) {
        const totalAmount = carts.reduce((acc: number, item: any) => {
          const price = Number(item.product?.price) || 0
          const quantity = item.product_number || 0
          const discount = quantity >= 10 ? 0.2 : 0
          const itemTotal = price * quantity * (1 - discount)
          return acc + itemTotal
        }, 0)

        setTotalPrice(totalAmount)
      } else {
        setTotalPrice(0)
      }
    } catch (error) {
      console.log('🚀 ~ handleCalculateTheTotalAmount ~ error:', error)
    }
  }, [carts])

  const handleUpdateQuantity = async (cartId: number, newQuantity: number, productPrice: number) => {
    try {
      const price = Number(productPrice)
      const discount = newQuantity >= 10 ? 0.2 : 0 // 20% discount for bulk orders
      const newTotalPrice = price * newQuantity * (1 - discount)

      await cartServices.update(cartId, {
        product_number: newQuantity,
        total_price: newTotalPrice
      })

      handleGetAllCart()
    } catch (error) {
      openNotificationError(error)
    }
  }

  useEffect(() => {
    handleGetAllCart()
  }, [])

  useEffect(() => {
    handleCalculateTheTotalAmount()
  }, [carts])

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Breadcrumb */}
      <div className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center text-sm'>
          <div
            className='flex items-center text-gray-500 hover:text-primary cursor-pointer transition-colors'
            onClick={() => navigate('/')}
          >
            <Home className='w-4 h-4 mr-1' />
            <span>Trang chủ</span>
          </div>
          <ChevronRight className='w-4 h-4 mx-2 text-gray-400' />
          <span className='font-medium text-gray-900'>Giỏ hàng</span>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-2 h-8 bg-primary rounded-full'></div>
          <h2 className='text-2xl font-bold sm:text-3xl font-black text-gray-900 uppercase tracking-tight'>
            Giỏ hàng của bạn
          </h2>
        </div>

        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          {/* Left Column: Cart Items */}
          <div className='w-full lg:w-2/3 flex flex-col gap-6'>
            {carts && carts.length > 0 ? (
              carts.map((c: any) => (
                <div
                  className='bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow'
                  key={c.id}
                >
                  <div
                    className='w-full sm:w-[140px] flex-shrink-0 cursor-pointer'
                    onClick={() => navigate(`${USER_PATH.PRODUCT_DETAIL}/${c.product_id}`)}
                  >
                    <div className='aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center'>
                      <img
                        className='w-full h-full object-contain mix-blend-multiply p-2 hover:scale-105 transition-transform duration-300'
                        src={c.product?.image || 'https://via.placeholder.com/150'}
                        alt={c.product?.name}
                      />
                    </div>
                  </div>

                  <div className='flex-1 flex flex-col justify-between py-1'>
                    <div className='flex justify-between items-start gap-4'>
                      <div>
                        <h2
                          className='text-lg font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary transition-colors'
                          onClick={() => navigate(`${USER_PATH.PRODUCT_DETAIL}/${c.product_id}`)}
                        >
                          {c?.product?.name}
                        </h2>
                        <div className='flex items-center mt-2'>
                          <span className='text-sm text-gray-500 mr-2'>Đơn giá:</span>
                          <span className='font-bold text-gray-900'>{formatPrice(c.product?.price)} ₫</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCart(c.id)}
                        className='text-gray-400 hover:text-red-500 p-2 bg-gray-50 hover:bg-red-50 rounded-full transition-colors'
                        title='Xóa sản phẩm'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>

                    <div className='mt-6 flex flex-wrap items-center gap-6'>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-bold text-gray-700 uppercase'>Size:</span>
                        <Select
                          size='middle'
                          style={{ width: 80 }}
                          value={c.size}
                          className='[&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200'
                          onChange={async (value: string) => {
                            await cartServices.update(c.id, { size: value })
                            handleGetAllCart()
                          }}
                          options={[
                            { value: 's', label: 'S' },
                            { value: 'm', label: 'M' },
                            { value: 'l', label: 'L' },
                            { value: 'xl', label: 'XL' },
                            { value: '2xl', label: '2XL' }
                          ]}
                        />
                      </div>

                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-bold text-gray-700 uppercase'>SL:</span>
                        <InputNumber
                          min={1}
                          value={c.product_number}
                          onChange={async (value: number) => {
                            if (value && value > 0) {
                              const price = Number(c.product?.price)
                              await handleUpdateQuantity(c.id, value, price)
                            }
                          }}
                          className='!rounded-xl !border-gray-200 hover:!border-primary focus:!border-primary !w-20'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-end justify-between sm:w-[150px] mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100'>
                    <div className='text-right w-full'>
                      <div className='text-sm font-medium text-gray-500 mb-1'>Thành tiền</div>
                      <div className='text-2xl font-black text-primary'>
                        {formatPrice(
                          c.product_number >= 10
                            ? c.product?.price * c.product_number * (1 - 0.2)
                            : c.product?.price * c.product_number
                        )}{' '}
                        <span className='text-lg underline decoration-2 underline-offset-4'>đ</span>
                      </div>
                      {c.product_number >= 10 && (
                        <div className='mt-2 inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200'>
                          Giảm sỉ 20%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-80 bg-white rounded-3xl shadow-sm border border-gray-100'>
                <ShoppingBag className='w-16 h-16 text-gray-300 mb-4' />
                <h3 className='text-xl font-bold text-gray-900 mb-2'>Giỏ hàng trống</h3>
                <p className='text-gray-500 mb-6'>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <button
                  onClick={() => navigate(USER_PATH.PRODUCT)}
                  className='px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-hover hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                >
                  Khám phá ngay
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          {carts && carts.length > 0 && (
            <div className='w-full lg:w-1/3'>
              <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24'>
                <h2 className='text-xl font-bold text-gray-900 uppercase tracking-wide mb-6'>Tóm tắt đơn hàng</h2>

                {/* <div className='mb-6'>
                  <label className='block text-sm font-bold mb-3 text-gray-700'>Mã khuyến mãi</label>
                  <div className='flex gap-2'>
                    <input
                      className='flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium placeholder-gray-400'
                      type='text'
                      placeholder='Nhập mã giảm giá...'
                    />
                    <button className='bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-gray-800 transition-colors shadow-md'>
                      Áp dụng
                    </button>
                  </div>
                </div> */}

                <div className='border-t border-gray-100 my-6'></div>

                <div className='space-y-4 mb-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-500 font-medium'>Tổng tiền hàng</span>
                    <span className='font-bold text-gray-900'>{formatPrice(totalPrice)} ₫</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-500 font-medium'>Phí vận chuyển</span>
                    <span className='font-bold text-gray-900'>Chưa tính</span>
                  </div>
                </div>

                <div className='border-t border-dashed border-gray-200 my-6'></div>

                <div className='mb-8 flex items-end justify-between'>
                  <span className='font-bold text-gray-900 uppercase'>Tổng cộng</span>
                  <div className='text-right'>
                    <div className='text-3xl font-black text-primary'>
                      {formatPrice(totalPrice)}{' '}
                      <span className='text-xl underline decoration-2 underline-offset-4'>đ</span>
                    </div>
                    <div className='text-xs text-gray-400 mt-1 font-medium'>Đã bao gồm VAT (nếu có)</div>
                  </div>
                </div>

                <button
                  className='w-full bg-primary  font-bold text-white py-4 px-6 rounded-2xl text-lg font-black uppercase shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-hover hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2'
                  onClick={() => navigate(`${USER_PATH.ORDER}`, { state: { cart: carts } })}
                >
                  <ShoppingBag className='w-5 h-5' />
                  Tiến hành đặt hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPage
