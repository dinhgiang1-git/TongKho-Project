import { Form, Input, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Config from 'common/constants/config'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { orderServices } from './orderApis'
import { formatPrice, getOptionListSelector, openNotification, openNotificationError } from 'common/utils'
import { useLocation, useNavigate } from 'react-router'
import { USER_PATH } from 'common/constants/paths'
import { ChevronRight, Home, ShieldCheck, MapPin, CreditCard, Banknote } from 'lucide-react'
import { useSelector } from 'react-redux'
import LocalStorage from 'apis/localStorage'

const calculateLineTotal = (item: any) => {
  const price = Number(item.product?.price || item.price) || 0
  const quantity = Number(item.product_number) || 0

  return Math.round(price * quantity)
}

function OrderPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const currentUser = useSelector((state: any) => state.login.user)
  const [provinces, setProvinces] = useState<Array<any>>([])
  const [districts, setDistricts] = useState<Array<any>>([])
  const [wards, setWards] = useState<Array<any>>([])
  const [province, setProvince] = useState<string>('')
  const [district, setDistrict] = useState<string>('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const { state } = location || {}
  const listOrders = useMemo(() => state?.cart || [], [state?.cart])

  const listProvince = getOptionListSelector(provinces, 'name', 'id')
  const listDistrict = getOptionListSelector(districts, 'name', 'id')
  const listWards = getOptionListSelector(wards, 'name', 'id')

  const getProvince = useCallback(async () => {
    try {
      const res = await orderServices.getProvince()

      console.log('🚀 ~ getProvince ~ res:', res)
      setProvinces(res?.data)
    } catch (error) {
      console.log('🚀 ~ getProvince ~ error:', error)
    }
  }, [])

  const getDistricts = useCallback(async (districtId: string) => {
    try {
      const res = await orderServices.getDistrict(districtId)
      setDistricts(res?.data)
    } catch (error) {
      console.log('🚀 ~ getDistricts ~ error:', error)
    }
  }, [])

  const getWards = useCallback(async (wardId: string) => {
    try {
      const res = await orderServices.getWards(wardId)
      setWards(res?.data)
    } catch (error) {
      console.log('🚀 ~ getWards ~ error:', error)
    }
  }, [])

  const handleCalculateTheTotalAmount = useCallback(() => {
    try {
      if (listOrders && listOrders.length) {
        const totalAmount = listOrders.reduce((acc: number, item: any) => {
          return calculateLineTotal(item) + acc
        }, 0)

        setTotalPrice(totalAmount)
      } else {
        setTotalPrice(0)
      }
    } catch (error) {
      console.log('🚀 ~ handleCalculateTheTotalAmount ~ error:', error)
    }
  }, [listOrders])

  const handleSubmit = async (value: any) => {
    try {
      setIsSubmitting(true)
      const items = listOrders.map((item: any) => ({
        product_id: item.product_id,
        product_number: item.product_number,
        cart_id: LocalStorage.getToken() ? item.id : undefined
      }))
      const res: any = await orderServices.createOrder({ ...value, items, total_price: totalPrice, payment_method: paymentMethod })
      if (res) {
        if (!LocalStorage.getToken()) {
          LocalStorage.removeGuestCart()
        }
        window.dispatchEvent(new Event('cart_updated'))

        // If VNPay, redirect to payment URL
        if (paymentMethod === 'VNPAY' && res.data?.payment_url) {
          window.location.href = res.data.payment_url
          return
        }

        navigate(`${USER_PATH.ORDER_SUCCESS}`)
        openNotification('success', 'Thành công', 'Bạn đã đặt hàng thành công!')
      }
    } catch (error) {
      openNotificationError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    getProvince()
  }, [getProvince])

  useEffect(() => {
    getDistricts(province)
  }, [getDistricts, province])

  useEffect(() => {
    getWards(district)
  }, [district, getWards])

  useEffect(() => {
    handleCalculateTheTotalAmount()
  }, [handleCalculateTheTotalAmount])

  useEffect(() => {
    if (!currentUser) return

    form.setFieldsValue({
      name: currentUser?.name,
      phone: currentUser?.phone,
      email: currentUser?.email
    })
  }, [currentUser, form])

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
          <span className='font-medium text-gray-900'>Đặt hàng & Thanh toán</span>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-2 h-8 bg-primary rounded-full'></div>
          <h2 className='text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight'>Thanh toán an toàn</h2>
        </div>

        <Form
          form={form}
          name='addEditCustomer'
          labelAlign='left'
          onFinish={handleSubmit}
          scrollToFirstError
          layout='vertical'
          className='flex flex-col lg:flex-row gap-8 lg:gap-12'
        >
          {/* Left Column: Form Fields */}
          <div className='w-full lg:w-3/5'>
            <div className='bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100'>
              <div className='flex items-center gap-2 mb-6 text-xl font-bold text-gray-900 border-b border-gray-100 pb-4'>
                <MapPin className='w-6 h-6 text-primary' />
                Thông tin giao hàng
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6'>
                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Họ và tên</span>}
                  name='name'
                  className='md:col-span-2'
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đầy đủ!' },
                    { pattern: Config._reg.name, message: 'Họ và tên không hợp lệ!' }
                  ]}
                >
                  <Input
                    size='large'
                    className='!rounded-xl hover:border-primary focus:border-primary'
                    placeholder='Nhập họ và tên của bạn'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Số điện thoại</span>}
                  name='phone'
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: Config._reg.phone, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input
                    size='large'
                    className='!rounded-xl hover:border-primary focus:border-primary'
                    placeholder='Nhập số điện thoại'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Email</span>}
                  name='email'
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { pattern: Config._reg.email, message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    size='large'
                    type='email'
                    placeholder='Nhập email của bạn'
                    className='!rounded-xl hover:border-primary focus:border-primary'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Tỉnh/Thành Phố</span>}
                  name='city'
                  className='md:col-span-2'
                  rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                >
                  <Select
                    size='large'
                    showSearch
                    placeholder='Chọn tỉnh/Thành phố'
                    optionFilterProp='label'
                    onChange={(value) => setProvince(value)}
                    options={listProvince}
                    className='[&_.ant-select-selector]:!rounded-xl'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Quận/Huyện</span>}
                  name='district'
                  rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                >
                  <Select
                    size='large'
                    showSearch
                    placeholder='Chọn Quận/Huyện'
                    optionFilterProp='label'
                    onChange={(value) => setDistrict(value)}
                    options={listDistrict}
                    className='[&_.ant-select-selector]:!rounded-xl'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Phường/Xã</span>}
                  name='ward'
                  rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                >
                  <Select
                    size='large'
                    showSearch
                    placeholder='Chọn Phường/Xã'
                    optionFilterProp='label'
                    options={listWards}
                    className='[&_.ant-select-selector]:!rounded-xl'
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='font-semibold text-gray-700'>Địa chỉ cụ thể</span>}
                  name='address'
                  className='md:col-span-2'
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                >
                  <TextArea
                    className='!rounded-xl hover:border-primary focus:border-primary p-3'
                    placeholder='Số nhà, tên đường, tòa nhà...'
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Form.Item>
              </div>

              {/* Payment Method Selection */}
              <div className='mt-8 border-t border-gray-100 pt-6'>
                <div className='flex items-center gap-2 mb-4 text-xl font-bold text-gray-900'>
                  <CreditCard className='w-6 h-6 text-primary' />
                  Phương thức thanh toán
                </div>
                <div className='space-y-3'>
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'COD'
                        ? 'border-primary bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className='w-2.5 h-2.5 rounded-full bg-primary' />}
                    </div>
                    <div className='w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0'>
                      <Banknote className='w-6 h-6 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='font-bold text-gray-900 text-sm'>Thanh toán khi nhận hàng (COD)</div>
                      <div className='text-xs text-gray-500 mt-0.5'>Thanh toán bằng tiền mặt khi nhận được hàng</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('VNPAY')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'VNPAY'
                        ? 'border-primary bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      paymentMethod === 'VNPAY' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'VNPAY' && <div className='w-2.5 h-2.5 rounded-full bg-primary' />}
                    </div>
                    <div className='w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0'>
                      <CreditCard className='w-6 h-6 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='font-bold text-gray-900 text-sm'>Thanh toán qua VNPay</div>
                      <div className='text-xs text-gray-500 mt-0.5'>ATM / Visa / MasterCard / QR Pay / Ví điện tử</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className='w-full lg:w-2/5'>
            <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24'>
              <h2 className='text-xl font-black text-gray-900 uppercase tracking-wide mb-6'>Đơn hàng của bạn</h2>

              <div className='w-full border-t border-gray-100 mb-6'></div>

              <div className='max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6'>
                {listOrders &&
                  listOrders.length > 0 &&
                  listOrders.map((item: any, idx: number) => (
                    <div key={idx} className='flex flex-col gap-2 p-3 bg-gray-50 rounded-xl'>
                      <div className='flex justify-between items-start gap-4'>
                        <div className='font-bold text-gray-800 line-clamp-2 leading-tight'>{item?.product.name}</div>
                        <div className='font-bold text-primary flex-shrink-0'>
                          {formatPrice(calculateLineTotal(item))} ₫
                        </div>
                      </div>
                      <div className='flex justify-between items-center text-sm text-gray-500 font-medium'>
                        <span>
                          SL: <span className='font-bold text-gray-700'>{item.product_number}</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className='w-full border-t border-dashed border-gray-200 mb-6'></div>

              <div className='space-y-4 mb-6'>
                <div className='flex items-center justify-between text-gray-600 font-medium'>
                  <span>Tạm tính</span>
                  <span className='font-bold text-gray-900'>{formatPrice(totalPrice)} ₫</span>
                </div>

                <div className='flex items-center justify-between text-gray-600 font-medium'>
                  <span>Phí vận chuyển</span>
                  <span className='font-bold text-gray-900'>Miễn phí</span>
                </div>
              </div>

              <div className='w-full border-t border-gray-100 mb-6'></div>

              <div className='mb-8 flex items-end justify-between'>
                <span className='font-bold text-gray-900 uppercase'>Tổng cộng</span>
                <div className='text-right'>
                  <div className='text-3xl font-black text-primary'>
                    {formatPrice(totalPrice)}{' '}
                    <span className='text-xl underline decoration-2 underline-offset-4'>đ</span>
                  </div>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-primary text-white py-4 px-6 rounded-2xl text-lg font-black uppercase shadow-[0_4px_14px_0_rgba(var(--primary-rgb,37,99,235),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary-rgb,37,99,235),0.23)] hover:bg-hover hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0'
              >
                <ShieldCheck className='w-5 h-5' />
                {isSubmitting ? 'Đang xử lý...' : paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Hoàn tất đặt hàng'}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default OrderPage
