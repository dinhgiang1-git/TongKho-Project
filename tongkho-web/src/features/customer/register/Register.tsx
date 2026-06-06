import { Form, Input, Spin } from 'antd'
import Config from 'common/constants/config'
import { openNotification, openNotificationError } from 'common/utils'
import { accountServices } from '../account/accountApis'
import { useNavigate } from 'react-router'
import { USER_PATH } from 'common/constants/paths'
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Package, Star, Gift, Users } from 'lucide-react'

function RegisterPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      const res = await accountServices.register(values)
      if (res) {
        openNotification('success', 'Thành công', 'Đăng ký tài khoản thành công')
        navigate(`${USER_PATH.LOGIN}`)
      }
    } catch (error) {
      openNotificationError(error)
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    { icon: <Star className='w-5 h-5' />, text: 'Tích điểm thưởng với mỗi đơn hàng' },
    { icon: <Gift className='w-5 h-5' />, text: 'Nhận ưu đãi độc quyền thành viên mới' },
    { icon: <Users className='w-5 h-5' />, text: 'Cộng đồng mua sắm uy tín hàng đầu' },
    { icon: <Package className='w-5 h-5' />, text: 'Theo dõi đơn hàng dễ dàng mọi lúc' }
  ]

  return (
    <div className='min-h-screen flex'>
      {/* ── LEFT PANEL ── */}
      <div
        className='hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden'
        style={{ background: 'linear-gradient(135deg, #180505 0%, #3f0712 60%, #0f172a 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className='absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full opacity-20 blur-3xl'
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }}
        />
        <div
          className='absolute bottom-[-60px] left-[-40px] w-80 h-80 rounded-full opacity-15 blur-3xl'
          style={{ background: 'radial-gradient(circle, #b91c1c, transparent)' }}
        />

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className='relative z-10 flex items-center gap-3'
        >
          <div
            className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
            style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
          >
            <Package className='w-5 h-5 text-white' />
          </div>
          <div>
            <div className='text-white font-bold text-lg leading-none'>Minh Ngọc</div>
            <div className='text-red-300 text-xs leading-none mt-0.5'>Kim Khí</div>
          </div>
        </motion.div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='relative z-10'
        >
          <h2 className='text-4xl font-extrabold text-white leading-tight mb-4'>
            Tham gia
            <br />
            <span
              className='text-transparent bg-clip-text'
              style={{ backgroundImage: 'linear-gradient(90deg, #fca5a5, #f87171)' }}
            >
              cùng chúng tôi!
            </span>
          </h2>
          <p className='text-red-200 text-base mb-10 leading-relaxed'>
            Đăng ký miễn phí và nhận ngay hàng loạt quyền lợi hấp dẫn dành riêng cho thành viên mới.
          </p>

          <div className='space-y-4'>
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className='flex items-center gap-3'
              >
                <div
                  className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}
                >
                  <span className='text-red-400'>{b.icon}</span>
                </div>
                <span className='text-red-100 text-sm'>{b.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className='relative z-10 text-red-300 text-xs'
        >
          © 2025 Kim Khí Minh Ngọc. All rights reserved.
        </motion.p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className='flex-1 flex items-center justify-center px-6 py-10 bg-gray-50 overflow-y-auto'>
        <Spin spinning={loading} className='w-full !max-h-none'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-md'
          >
            {/* Mobile logo */}
            <div className='flex lg:hidden justify-center mb-6'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                >
                  <Package className='w-5 h-5 text-white' />
                </div>
                <div>
                  <div className='font-bold text-lg text-gray-900 leading-none'>Minh Ngọc</div>
                  <div className='text-red-500 text-xs leading-none mt-0.5'>Kim Khí</div>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className='mb-6'>
              <h1 className='text-2xl font-extrabold text-gray-900 mb-1'>Tạo tài khoản</h1>
              <p className='text-gray-500 text-sm'>Điền đầy đủ thông tin để hoàn tất đăng ký</p>
            </div>

            {/* Form */}
            <Form form={form} layout='vertical' className='space-y-0.5'>
              <Form.Item
                name='name'
                label={<span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Họ và tên</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập tên!' },
                  { pattern: Config._reg.name, message: 'Họ và tên không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập họ và tên'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name='username'
                label={
                  <span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Tên đăng nhập</span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, max: 50, message: 'Tên đăng nhập từ 3-50 ký tự!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập tên đăng nhập'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name='phone'
                label={
                  <span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Số điện thoại</span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: Config._reg.phone, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập số điện thoại'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name='email'
                label={<span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { pattern: Config._reg.email, message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập địa chỉ email'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name='password'
                label={<span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Mật khẩu</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { pattern: Config._reg.pass, message: 'Mật khẩu không hợp lệ!' }
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined className='text-gray-400 mr-1' />}
                  placeholder='Tạo mật khẩu'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <Form.Item
                name='confirmPassword'
                label={
                  <span className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Xác nhận mật khẩu</span>
                }
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve()
                      return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'))
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className='text-gray-400 mr-1' />}
                  placeholder='Nhập lại mật khẩu'
                  size='large'
                  style={{ borderRadius: 10, height: 46 }}
                />
              </Form.Item>

              <div className='pt-2'>
                <motion.button
                  type='button'
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleSubmit}
                  className='w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-base transition-all duration-200 shadow-lg disabled:opacity-60'
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.35)'
                  }}
                >
                  {loading ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      {' '}
                      Đăng ký ngay <ArrowRightOutlined />
                    </>
                  )}
                </motion.button>
              </div>
            </Form>

            {/* Divider */}
            <div className='flex items-center gap-3 my-5'>
              <div className='flex-1 h-px bg-gray-200' />
              <span className='text-xs text-gray-400'>hoặc</span>
              <div className='flex-1 h-px bg-gray-200' />
            </div>

            <p className='text-center text-sm text-gray-600'>
              Đã có tài khoản?{' '}
              <a href={USER_PATH.LOGIN} className='font-bold text-red-600 hover:text-red-700 transition-colors'>
                Đăng nhập ngay →
              </a>
            </p>
          </motion.div>
        </Spin>
      </div>
    </div>
  )
}

export default RegisterPage
