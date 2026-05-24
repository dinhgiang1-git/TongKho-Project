/* eslint-disable @typescript-eslint/no-unused-vars */
import { Carousel, Layout } from 'antd'
import { Content, Header } from 'antd/es/layout/layout'
import { useCallback, useEffect, useState } from 'react'
import { productServices } from '../product/productApis'
import { homeServices } from './homeApis'
import CardComponent from 'common/components/cart/Cart.tsx'
import { useNavigate } from 'react-router'
import { USER_PATH } from 'common/constants/paths'
import { TrophyOutlined, SyncOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons'

interface urlBackground {
  url: string
}
const contentStyle: React.CSSProperties = {
  height: '700px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}

const backGrounds: Array<urlBackground> = [{ url: '/banner5.png' }, { url: '/banner6.png' }]

function HomePage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any>([])
  const [categories, setCategories] = useState<any>([])
  const [payload, setPayload] = useState<any>({
    page: 1,
    take: 10,
    q: '',
    to_date: '',
    from_date: ''
  })

  const handleGetProducts = useCallback(async (payload: any) => {
    try {
      const res = await productServices.get(payload)
      setProducts(res.data)
    } catch (error) {
      console.log('🚀 ~ handleGetProducts ~ error:', error)
    }
  }, [])

  const handleGetCategory = useCallback(async (payload: any) => {
    try {
      const res = await homeServices.getCategory(payload)
      setCategories(res.data)
    } catch (error) {
      console.log('🚀 ~ handleGetCategory ~ error:', error)
    }
  }, [])

  useEffect(() => {
    handleGetProducts(payload)
    handleGetCategory(payload)
  }, [payload])

  const features = [
    {
      icon: <TrophyOutlined className='text-4xl text-red-600 mb-4' />,
      title: 'Sản phẩm chính hãng',
      desc: 'Cam kết 100% chất lượng từ nhà sản xuất'
    },
    {
      icon: <SyncOutlined className='text-4xl text-red-600 mb-4' />,
      title: 'Đổi trả dễ dàng',
      desc: 'Hỗ trợ đổi trả trong vòng 7 ngày'
    },
    {
      icon: <SafetyCertificateOutlined className='text-4xl text-red-600 mb-4' />,
      title: 'Bảo hành uy tín',
      desc: 'Chính sách bảo hành tận tâm, minh bạch'
    },
    {
      icon: <CustomerServiceOutlined className='text-4xl text-red-600 mb-4' />,
      title: 'Hỗ trợ 24/7',
      desc: 'Luôn sẵn sàng tư vấn và giải đáp thắc mắc'
    }
  ]

  return (
    <div className='bg-gray-50 min-h-screen pb-10'>
      {/* Banner Slider */}
      <Carousel className='h-[700px]' autoplay effect='fade'>
        {backGrounds.map((item, index) => (
          <div key={index}>
            <div style={{ ...contentStyle, backgroundImage: `url(${item.url})` }}>
              <div className='w-full h-full bg-black/10 flex flex-col items-center justify-center'></div>
            </div>
          </div>
        ))}
      </Carousel>

      <Layout className='bg-transparent'>
        {/* Categories Menu */}
        <Header className='flex flex-wrap items-center justify-center text-sm font-semibold h-auto py-4 bg-white shadow-sm z-10 gap-x-8 gap-y-2 border-b border-gray-50'>
          {categories &&
            categories.length > 0 &&
            categories.map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => navigate(USER_PATH.PRODUCT, { state: { category_id: item.id } })}
                className='cursor-pointer text-gray-700 hover:text-red-600 transition-colors uppercase tracking-wider py-2'
              >
                {item?.name}
              </div>
            ))}
        </Header>

        <Content>
          {/* Features Section */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-lg hover:border-red-50 transition-all duration-300 transform hover:-translate-y-1'
                >
                  {feature.icon}
                  <h3 className='text-lg font-bold text-gray-800 mb-2'>{feature.title}</h3>
                  <p className='text-sm text-gray-500 leading-relaxed'>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-4'>
                Sản phẩm nổi bật
              </h2>
              <div className='h-1.5 w-24 bg-red-600 mx-auto rounded-full'></div>
              <p className='mt-4 text-gray-500 text-lg max-w-2xl mx-auto'>
                Tuyển chọn những sản phẩm bán chạy và chất lượng nhất dành cho bạn
              </p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6'>
              {products && products.length > 0 ? (
                products.map((item: any, index: number) => <CardComponent key={index} data={item} />)
              ) : (
                <div className='col-span-full text-center py-10 text-gray-500'>Đang tải sản phẩm...</div>
              )}
            </div>

            <div className=' font-bold text-center mt-12'>
              <button
                onClick={() => navigate(USER_PATH.PRODUCT)}
                className='inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg md:text-lg md:px-12 transition-all duration-300 hover:scale-105 active:scale-95'
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          </div>

          {/* Promotional Banner Section */}
          <div className='bg-white py-16 border-t border-b border-gray-50 mt-8 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full bg-red-50/50 transform -skew-y-3 origin-top-left -z-10'></div>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center border border-gray-800'>
                <div className='p-10 md:p-16 flex-1 z-10 relative'>
                  {/* Decorative element */}
                  <div className='absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl'></div>

                  <span className='inline-block px-4 py-1.5 bg-red-600/20 text-red-400 font-bold tracking-wider uppercase text-xs rounded-full mb-6 border border-red-500/30'>
                    Ưu đãi đặc biệt
                  </span>
                  <h2 className='text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1]'>
                    Giảm giá lên đến{' '}
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600'>50%</span>{' '}
                    <br /> cho khách mới
                  </h2>
                  <p className='text-gray-400 mb-8 max-w-lg text-lg leading-relaxed'>
                    Đăng ký thành viên ngay hôm nay để nhận được những ưu đãi độc quyền và cập nhật tin tức mới nhất từ
                    hệ thống của chúng tôi.
                  </p>
                  <button className='bg-white text-gray-900 hover:bg-red-600 hover:text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                    Đăng ký ngay &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New Arrivals (Re-using products array for layout demonstration) */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
            <div className='flex flex-col sm:flex-row items-center justify-between mb-10 border-b border-gray-50 pb-4'>
              <div className='flex items-center gap-4 mb-4 sm:mb-0'>
                <div className='w-2 h-8 bg-red-600 rounded-full'></div>
                <h2 className='text-2xl font-bold md:text-3xl font-black text-gray-900 uppercase tracking-tight'>
                  Hàng mới về
                </h2>
              </div>
              <button
                onClick={() => navigate(USER_PATH.PRODUCT)}
                className='text-red-600 font-bold hover:text-red-700 flex items-center group transition-colors'
              >
                Xem tất cả
                <span className='ml-2 transform group-hover:translate-x-1 transition-transform'>&rarr;</span>
              </button>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
              {/* Display first 4 items as "new arrivals" */}
              {products &&
                products
                  .slice(0, 4)
                  .map((item: any, index: number) => <CardComponent key={`new-${index}`} data={item} />)}
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  )
}

export default HomePage
