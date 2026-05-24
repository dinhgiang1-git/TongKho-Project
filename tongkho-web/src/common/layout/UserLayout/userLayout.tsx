import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Dropdown, Form, Input, Layout } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { MenuProps } from 'antd/lib'
import { useDispatch, useSelector } from 'react-redux'
import { setLogin } from 'redux/slice/login.slice'
import { openNotification } from 'common/utils'
import _ from 'lodash'
import { USER_PATH } from 'common/constants/paths'
import AccountUser from 'features/customer/account/components/Account'
import { AnimatePresence } from 'framer-motion'
import PageTransition from 'common/components/PageTransition'
import { ShoppingCart, Search, Menu, Wrench, ShieldCheck, Truck, MapPin, Mail, Phone, ChevronRight } from 'lucide-react'
import { Badge } from 'antd'
import { cartServices } from 'features/customer/cart/cartApis'

const { Header, Footer, Content } = Layout

const layoutStyle = {
  overflow: 'hidden',
  width: '100vw',
  maxWidth: '100%'
}

const UserLayout: React.FC = ({ children }: any) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [userData, setUserData] = useState<any>({})
  const data = useSelector((state: any) => state.login)
  const [modalAccountIsvisible, setModalAccountIsVisible] = useState<boolean>(false)
  const [cartCount, setCartCount] = useState<number>(0)

  const fetchCartCount = async () => {
    try {
      if (!localStorage.getItem('token')) return
      const res = await cartServices.get()
      if (res && res.data) {
        setCartCount(res.data.length)
      } else {
        setCartCount(0)
      }
    } catch (error) {
      console.log('Error fetching cart count:', error)
    }
  }

  useEffect(() => {
    fetchCartCount()
    window.addEventListener('cart_updated', fetchCartCount)
    return () => {
      window.removeEventListener('cart_updated', fetchCartCount)
    }
  }, [])

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('data')
    dispatch(setLogin(undefined))
    openNotification('success', 'Thành công', 'Đăng xuất thành công!')
    handleNavigate('/')
  }, [])

  const handleCloseModal = () => {
    setModalAccountIsVisible(false)
  }

  useEffect(() => {
    setUserData(data)
  }, [data])

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link to='/order/history'>Đơn hàng</Link>
    },
    {
      key: '2',
      label: (
        <p
          rel='noopener noreferrer'
          onClick={() => {
            setModalAccountIsVisible(!modalAccountIsvisible)
          }}
        >
          Tài khoản
        </p>
      )
    },
    {
      key: '3',
      label: _.isEmpty(data.user) ? (
        <div
          onClick={() => {
            navigate(USER_PATH.LOGIN)
          }}
        >
          Đăng nhập
        </div>
      ) : (
        <div onClick={handleLogout}>Đăng xuất</div>
      )
    }
  ]

  return (
    <Layout style={layoutStyle} className='font-sans'>
      {/* Top Banner */}
      <div className='hidden md:flex bg-primary text-white text-xs font-medium py-2 px-8 justify-between items-center z-50 relative'>
        <div className='flex gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 justify-between'>
          <div className='flex gap-6'>
            <div className='flex items-center gap-2'>
              <Truck className='w-4 h-4' /> Miễn phí vận chuyển toàn quốc
            </div>
            <div className='flex items-center gap-2'>
              <ShieldCheck className='w-4 h-4' /> Cam kết chính hãng 100%
            </div>
          </div>
          <div className='flex gap-6'>
            <span className='hover:text-blue-200 cursor-pointer transition-colors flex items-center gap-1'>
              <Phone className='w-3 h-3' /> Hotline: 038.4609.456
            </span>
            <span className='hover:text-blue-200 cursor-pointer transition-colors'>Hỗ trợ khách hàng</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <Header
        style={{ height: 'auto', padding: 0 }}
        className='bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center cursor-pointer group' onClick={() => handleNavigate('/')}>
            <div className='w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform'>
              <Wrench className='w-6 h-6' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 leading-none tracking-tight'>TUẤN THỊNH</h1>
              <h2 className='text-sm font-bold text-primary leading-none tracking-widest mt-1 uppercase'>Kim Khí</h2>
            </div>
          </div>

          {/* Navigation */}
          <div className='hidden md:flex items-center gap-8'>
            <div
              className={`cursor-pointer font-bold transition-all duration-300 hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-gray-600'}`}
              onClick={() => handleNavigate('/')}
            >
              Trang chủ
            </div>
            <div
              className={`cursor-pointer font-bold transition-all duration-300 hover:text-primary ${location.pathname.includes('/product') ? 'text-primary' : 'text-gray-600'}`}
              onClick={() => handleNavigate('/product')}
            >
              Sản phẩm
            </div>
            <div
              className='cursor-pointer font-bold text-gray-600 transition-all duration-300 hover:text-primary'
              onClick={() => {}}
            >
              Liên hệ
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-6'>
            <div className='hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 hover:ring-2 hover:ring-primary/20 transition-all cursor-text'>
              <input
                type='text'
                placeholder='Tìm kiếm sản phẩm...'
                className='bg-transparent border-none outline-none text-sm w-48 font-medium text-gray-700 placeholder-gray-500'
              />
              <Search className='w-4 h-4 text-gray-500 cursor-pointer hover:text-primary transition-colors' />
            </div>

            <div
              className='cursor-pointer text-gray-600 hover:text-primary transition-colors relative mt-4'
              onClick={() => handleNavigate('/cart')}
            >
              <Badge count={cartCount} size='small' offset={[0, 2]} className='[&_.ant-badge-count]:bg-primary'>
                <ShoppingCart className='w-6 h-6' />
              </Badge>
            </div>

            <Dropdown menu={{ items }} placement='bottomRight' arrow={{ pointAtCenter: true }}>
              <div className='flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors'>
                <Avatar
                  size={36}
                  src={userData?.user?.avatar}
                  icon={<UserOutlined />}
                  className='border border-gray-200'
                />
              </div>
            </Dropdown>

            {/* Mobile Menu Icon */}
            <div className='md:hidden text-gray-600 cursor-pointer hover:text-primary transition-colors'>
              <Menu className='w-6 h-6' />
            </div>
          </div>
        </div>
      </Header>

      <Content className='bg-baseBackground min-h-[calc(100vh-400px)]'>
        <AnimatePresence mode='wait'>
          <PageTransition key={location.pathname}>
            <div>{children}</div>
          </PageTransition>
        </AnimatePresence>
      </Content>

      {/* Footer */}
      <Footer className='bg-[#0f172a] text-gray-400 py-16 px-4 sm:px-8 lg:px-24'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12'>
          <div className='space-y-6 md:col-span-2 lg:col-span-1'>
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => handleNavigate('/')}>
              <div className='w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md'>
                <Wrench className='w-6 h-6' />
              </div>
              <div>
                <h1 className='text-2xl font-black text-white leading-none tracking-tight'>TỔNG KHO</h1>
                <h2 className='text-sm font-bold text-primary leading-none tracking-widest mt-1 uppercase'>Kim Khí</h2>
              </div>
            </div>
            <p className='text-sm leading-relaxed'>
              Tổng Kho Kim Khí - Đơn vị cung cấp sỉ và lẻ các loại vật tư kim khí, dụng cụ cầm tay chuyên nghiệp, uy tín
              hàng đầu Việt Nam.
            </p>
            <div className='flex gap-4'>
              {/* Social icons could go here */}
              <div className='w-8 h-8 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors cursor-pointer text-white font-bold text-xs'>
                FB
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors cursor-pointer text-white font-bold text-xs'>
                YT
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors cursor-pointer text-white font-bold text-xs'>
                IG
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-white text-lg font-bold mb-6 tracking-wide uppercase border-l-4 border-primary pl-3'>
              Liên hệ
            </h3>
            <div className='space-y-4 text-sm'>
              <p className='flex items-start gap-3 hover:text-white transition-colors cursor-default'>
                <MapPin className='w-5 h-5 text-primary flex-shrink-0' />
                <span>299 Trung Kính, Yên Hòa, Cầu Giấy, Hà Nội</span>
              </p>
              <p className='flex items-center gap-3 hover:text-white transition-colors cursor-default'>
                <Phone className='w-5 h-5 text-primary flex-shrink-0' />
                <span className='font-bold text-white'>038.4609.456</span>
              </p>
              <p className='flex items-center gap-3 hover:text-white transition-colors cursor-pointer'>
                <Mail className='w-5 h-5 text-primary flex-shrink-0' />
                <span>thesonshop@gmail.com</span>
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-white text-lg font-bold mb-6 tracking-wide uppercase border-l-4 border-primary pl-3'>
              Hỗ trợ
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <span className='hover:text-primary cursor-pointer transition-colors flex items-center gap-2'>
                  <ChevronRight className='w-3 h-3' /> Chính sách bảo hành
                </span>
              </li>
              <li>
                <span className='hover:text-primary cursor-pointer transition-colors flex items-center gap-2'>
                  <ChevronRight className='w-3 h-3' /> Chính sách đổi trả
                </span>
              </li>
              <li>
                <span className='hover:text-primary cursor-pointer transition-colors flex items-center gap-2'>
                  <ChevronRight className='w-3 h-3' /> Hướng dẫn mua hàng
                </span>
              </li>
              <li>
                <span className='hover:text-primary cursor-pointer transition-colors flex items-center gap-2'>
                  <ChevronRight className='w-3 h-3' /> Phương thức thanh toán
                </span>
              </li>
              <li>
                <span className='hover:text-primary cursor-pointer transition-colors flex items-center gap-2'>
                  <ChevronRight className='w-3 h-3' /> Báo giá sỉ / Đại lý
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white text-lg font-bold mb-6 tracking-wide uppercase border-l-4 border-primary pl-3'>
              Đăng ký nhận tin
            </h3>
            <p className='text-sm mb-4'>Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên khi đăng ký.</p>
            <Form layout='vertical' className='w-full'>
              <Form.Item className='mb-3'>
                <div className='flex'>
                  <Input
                    placeholder='Nhập email của bạn...'
                    className='rounded-l-xl rounded-r-none border-none bg-gray-800 text-white placeholder-gray-500 hover:bg-gray-700 focus:bg-gray-700 focus:ring-0 h-10'
                  />
                  <Button
                    className='bg-primary hover:bg-hover text-white font-bold border-none rounded-r-xl rounded-l-none h-10 px-4 flex items-center justify-center transition-colors shadow-md'
                    type='primary'
                    htmlType='submit'
                  >
                    Gửi
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className='max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm font-medium'>
          © {new Date().getFullYear()} Tổng Kho Kim Khí. Thiết kế giao diện bởi Antigravity.
        </div>
      </Footer>
      <AccountUser openModal={modalAccountIsvisible} titleModal='Thông tin tài khoản' onClose={handleCloseModal} />
    </Layout>
  )
}

export default UserLayout
