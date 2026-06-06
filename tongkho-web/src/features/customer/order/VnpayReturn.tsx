import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ShoppingBag, ClipboardList, Loader2 } from 'lucide-react'
import { USER_PATH } from 'common/constants/paths'
import LocalStorage from 'apis/localStorage'
import { AxiosClient } from 'apis/axiosClient'

function VnpayReturn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const isAuthenticated = !!LocalStorage.getToken()

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const res: any = await AxiosClient.get('/vnpay/return', { params })

        // Backend wraps response in a ResponseDto with a .data property
        const result = res?.data || res;

        if (result?.isValid && result?.responseCode === '00') {
          setStatus('success')
          setOrderInfo({
            orderId: result.orderId,
            responseCode: result.responseCode
          })
          // Clean up guest cart on successful payment
          if (!LocalStorage.getToken()) {
            LocalStorage.removeGuestCart()
          }
          window.dispatchEvent(new Event('cart_updated'))
        } else {
          setStatus('failed')
          setOrderInfo({
            orderId: result?.orderId,
            responseCode: result?.responseCode
          })
        }
      } catch (error) {
        console.error('VNPay verify error:', error)
        setStatus('failed')
      }
    }

    verifyPayment()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-white rounded-3xl shadow-xl p-12 flex flex-col items-center text-center'
          style={{ maxWidth: 420 }}
        >
          <Loader2 className='w-16 h-16 text-blue-500 animate-spin mb-6' />
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Đang xác minh thanh toán...</h2>
          <p className='text-gray-500 text-sm'>Vui lòng đợi trong giây lát</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className='relative w-full min-h-screen flex items-center justify-center overflow-hidden'
      style={{
        background:
          status === 'success'
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)'
            : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fef2f2 100%)'
      }}
    >
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl'
          style={{
            background: `radial-gradient(circle, ${status === 'success' ? '#10b981' : '#ef4444'}, transparent)`
          }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl'
          style={{
            background: `radial-gradient(circle, ${status === 'success' ? '#06b6d4' : '#f97316'}, transparent)`
          }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative z-10 bg-white rounded-3xl shadow-2xl p-10 sm:p-14 flex flex-col items-center text-center mx-4'
        style={{ maxWidth: 460, boxShadow: `0 20px 60px ${status === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className='relative mb-6'
        >
          <motion.div
            className='absolute inset-0 rounded-full'
            style={{
              background: `radial-gradient(circle, ${status === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}, transparent)`
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className='w-28 h-28 rounded-full flex items-center justify-center'
            style={{
              background: status === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)'
            }}
          >
            {status === 'success' ? (
              <CheckCircle className='w-14 h-14 text-white' />
            ) : (
              <XCircle className='w-14 h-14 text-white' />
            )}
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {status === 'success' ? (
            <>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2'>
                Thanh toán thành công! 🎉
              </h1>
              <p className='text-gray-500 text-sm sm:text-base leading-relaxed mb-2'>
                Đơn hàng #{orderInfo?.orderId} đã được thanh toán qua VNPay thành công.
              </p>
              <p className='text-gray-400 text-sm mb-8'>
                Cảm ơn bạn đã tin tưởng mua hàng tại Kim khí Minh Ngọc.
              </p>
            </>
          ) : (
            <>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2'>
                Thanh toán thất bại
              </h1>
              <p className='text-gray-500 text-sm sm:text-base leading-relaxed mb-2'>
                Đơn hàng #{orderInfo?.orderId || '—'} chưa được thanh toán.
              </p>
              <p className='text-gray-400 text-sm mb-8'>
                Giao dịch đã bị hủy hoặc gặp lỗi. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
              </p>
            </>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className='flex flex-col sm:flex-row gap-3 w-full'
        >
          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(USER_PATH.ORDER_HISTORY)}
              className='flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-lg'
              style={{
                background: status === 'success'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #06b6d4)'
              }}
            >
              <ClipboardList className='w-4 h-4' />
              Xem đơn hàng
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(USER_PATH.PRODUCT)}
            className='flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200'
          >
            <ShoppingBag className='w-4 h-4' />
            Tiếp tục mua hàng
          </motion.button>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className='w-full h-1 rounded-full mt-8 overflow-hidden'
          style={{ background: status === 'success' ? '#f0fdf4' : '#fef2f2' }}
        >
          <motion.div
            className='h-full rounded-full'
            style={{
              background: status === 'success'
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #ef4444, #dc2626)'
            }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
          />
        </motion.div>
        <p className='text-xs text-gray-400 mt-2'>
          {status === 'success' ? 'Thanh toán đã được xác nhận' : 'Giao dịch không thành công'}
        </p>
      </motion.div>
    </div>
  )
}

export default VnpayReturn
