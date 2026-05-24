import { useCallback, useEffect, useState } from 'react'
import './adminDashbroad.css'
import { adminDashboardServices } from './adminDashboardApis'
import { formatPrice } from 'common/utils'
import RevenueChart from './components/RevenueData'
import TopProducts from './components/TopProducts'

function AdminDashboardScreen() {
  const [adminDashboardData, setAdminDashboardData] = useState<any>({})

  const getAdminDashboarData = useCallback(async () => {
    try {
      const res = await adminDashboardServices.get()
      if (res) {
        setAdminDashboardData({ ...res?.data })
      }
    } catch (error) {
      console.log('🚀 ~ getAdminDashboarData ~ error:', error)
    }
  }, [])

  useEffect(() => {
    getAdminDashboarData()
  }, [])

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-80'>Tổng khách hàng</p>
              <h3 className='text-2xl font-bold mt-2'>{formatPrice(adminDashboardData.countUsers)}</h3>
            </div>
            <div className='bg-white/20 p-3 rounded-full'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-80'>Tổng sản phẩm</p>
              <h3 className='text-2xl font-bold mt-2'>{formatPrice(adminDashboardData.countProducts)}</h3>
            </div>
            <div className='bg-white/20 p-3 rounded-full'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-80'>Danh mục</p>
              <h3 className='text-2xl font-bold mt-2'>{formatPrice(adminDashboardData.countCategories)}</h3>
            </div>
            <div className='bg-white/20 p-3 rounded-full'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 10h16M4 14h16M4 18h16'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-80'>Tổng đơn hàng</p>
              <h3 className='text-2xl font-bold mt-2'>{formatPrice(adminDashboardData.countOrders)}</h3>
            </div>
            <div className='bg-white/20 p-3 rounded-full'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <TopProducts />

      {/* Revenue Chart */}
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <RevenueChart />
      </div>

      {/* Top Products */}
    </div>
  )
}

export default AdminDashboardScreen
