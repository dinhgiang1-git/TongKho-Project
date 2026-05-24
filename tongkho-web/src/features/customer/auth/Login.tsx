import { Form, Input, Spin } from 'antd'
import { useState } from 'react'
import { authService } from './service/Apis'
import LocalStorage from 'apis/localStorage'
import { openNotification, openNotificationError } from 'common/utils'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setLogin } from 'redux/slice/login.slice'
import { LockOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { ShieldCheck, Package, Truck } from 'lucide-react'

function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm()

  const handleSubmit = async (value: any) => {
    try {
      setIsLoading(true)
      const res = await authService.login({
        username: value?.username,
        password: value?.password
      })
      if (res.status) {
        LocalStorage.setToken(res?.data?.token)
        LocalStorage.setData(res?.data?.id)
        LocalStorage.setRole(res?.data?.role)
        openNotification('success', 'Thành công!', 'Đăng nhập thành công.')
        dispatch(setLogin(res?.data))
        navigate('/')
      }
    } catch (error: any) {
      openNotificationError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: <Package className='w-5 h-5' />, text: 'Hàng ngàn sản phẩm kim khí chất lượng' },
    { icon: <Truck className='w-5 h-5' />, text: 'Giao hàng nhanh toàn quốc' },
    { icon: <ShieldCheck className='w-5 h-5' />, text: 'Đảm bảo chính hãng, hoàn tiền 100%' }
  ]

  return (
    <div className='min-h-screen flex'>
      {/* ── LEFT PANEL ── */}
      <div
        className='hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden'
        style={{ background: 'linear-gradient(135deg, #180505 0%, #3f0712 60%, #0f172a 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className='absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl'
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }}
        />
        <div
          className='absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-15 blur-3xl'
          style={{ background: 'radial-gradient(circle, #b91c1c, transparent)' }}
        />

        {/* Brand */}
        <div className='relative z-10'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='flex items-center gap-3'
          >
            <div
              className='w-10 h-10 rounded-xl flex items-center justify-center'
              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
            >
              <Package className='w-5 h-5 text-white' />
            </div>
            <div>
              <div className='text-white font-bold text-lg leading-none'>Tuấn Thịnh</div>
              <div className='text-red-300 text-xs leading-none mt-0.5'>Kim Khí</div>
            </div>
          </motion.div>
        </div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='relative z-10'
        >
          <h2 className='text-4xl font-extrabold text-white leading-tight mb-4'>
            Chào mừng
            <br />
            <span
              className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(90deg, #fca5a5, #f87171)' }}
            >
              trở lại!
            </span>
          </h2>
          <p className='text-red-200 text-base mb-10 leading-relaxed'>
            Đăng nhập để khám phá hàng ngàn sản phẩm kim khí chất lượng cao với giá tốt nhất thị trường.
          </p>

          <div className='space-y-4'>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className='flex items-center gap-3'
              >
                <div
                  className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}
                >
                  <span className='text-red-400'>{f.icon}</span>
                </div>
                <span className='text-red-100 text-sm'>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className='relative z-10'
        >
          <p className='text-red-300 text-xs'>© 2025 Kim Khí Tuấn Thịnh. All rights reserved.</p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className='flex-1 flex items-center justify-center px-6 py-12 bg-gray-50'>
        <Spin spinning={isLoading} className='w-full !max-h-none'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-md'
          >
            {/* Mobile logo */}
            <div className='flex lg:hidden justify-center mb-8'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                >
                  <Package className='w-5 h-5 text-white' />
                </div>
                <div>
                  <div className='font-bold text-lg text-gray-900 leading-none'>Tuấn Thịnh</div>
                  <div className='text-red-500 text-xs leading-none mt-0.5'>Kim Khí</div>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className='mb-8'>
              <h1 className='text-2xl font-extrabold text-gray-900 mb-1'>Đăng nhập</h1>
              <p className='text-gray-500 text-sm'>Nhập thông tin tài khoản của bạn để tiếp tục</p>
            </div>

            {/* Form */}
            <Form form={form} onFinish={handleSubmit} layout='vertical' className='space-y-1'>
              <Form.Item
                name='username'
                label={
                  <span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Tên đăng nhập</span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, max: 50, message: 'Tên đăng nhập từ 3-50 ký tự!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập tên đăng nhập'
                  size='large'
                  style={{ borderRadius: 10, height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name='password'
                label={<span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập mật khẩu'
                  size='large'
                  style={{ borderRadius: 10, height: 48 }}
                />
              </Form.Item>

              <div className='pt-2'>
                <motion.button
                  type='submit'
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className='w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-base transition-all duration-200 shadow-lg disabled:opacity-60'
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.35)'
                  }}
                >
                  {isLoading ? (
                    'Đang đăng nhập...'
                  ) : (
                    <>
                      Đăng nhập <ArrowRightOutlined />
                    </>
                  )}
                </motion.button>
              </div>
            </Form>

            {/* Divider */}
            <div className='flex items-center gap-3 my-6'>
              <div className='flex-1 h-px bg-gray-200' />
              <span className='text-xs text-gray-400'>hoặc</span>
              <div className='flex-1 h-px bg-gray-200' />
            </div>

            {/* Register link */}
            <p className='text-center text-sm text-gray-600'>
              Chưa có tài khoản?{' '}
              <a href='/register' className='font-bold text-red-600 hover:text-red-700 transition-colors'>
                Đăng ký ngay →
              </a>
            </p>
          </motion.div>
        </Spin>
      </div>
    </div>
  )
}

export default LoginPage
