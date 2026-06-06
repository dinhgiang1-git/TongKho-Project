import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Row } from 'antd'
import {
  TeamOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  InboxOutlined,
  BarChartOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './adminDashbroad.css'
import { adminDashboardServices } from './adminDashboardApis'
import { formatPrice } from 'common/utils'
import RevenueChart from './components/RevenueData'
import TopProducts from './components/TopProducts'
import { ADMIN_PATH } from 'common/constants/paths'

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
  }, [getAdminDashboarData])

  return (
    <div className='space-y-5 w-full'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold text-slate-800 m-0'>Tổng quan nhanh</h2>
          <p className='mt-1 text-xs text-slate-500'>
            Các chỉ số vận hành chính để theo dõi tình hình hệ thống trong ngày.
          </p>
        </div>
        <Link to={ADMIN_PATH.REPORT}>
          <Button type='default' icon={<BarChartOutlined />}>
            Xem báo cáo chuyên sâu <ArrowRightOutlined />
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className='border-l-4 border-l-blue-500 bg-white rounded-lg shadow-sm border-slate-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Tổng khách hàng</p>
                <h3 className='text-2xl font-bold text-slate-800 mt-2'>
                  {formatPrice(adminDashboardData.countUsers || 0)}
                </h3>
                <span className='text-[10px] text-slate-400'>Khách hàng trong hệ thống</span>
              </div>
              <div className='p-3 bg-blue-50 rounded-full text-blue-500 flex items-center justify-center text-xl w-11 h-11'>
                <TeamOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='border-l-4 border-l-emerald-500 bg-white rounded-lg shadow-sm border-slate-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Tổng sản phẩm</p>
                <h3 className='text-2xl font-bold text-slate-800 mt-2'>
                  {formatPrice(adminDashboardData.countProducts || 0)}
                </h3>
                <span className='text-[10px] text-slate-400'>Sản phẩm đang được bán</span>
              </div>
              <div className='p-3 bg-emerald-50 rounded-full text-emerald-500 flex items-center justify-center text-xl w-11 h-11'>
                <ShoppingOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='border-l-4 border-l-violet-500 bg-white rounded-lg shadow-sm border-slate-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Danh mục</p>
                <h3 className='text-2xl font-bold text-slate-800 mt-2'>
                  {formatPrice(adminDashboardData.countCategories || 0)}
                </h3>
                <span className='text-[10px] text-slate-400'>Danh mục hàng phân loại</span>
              </div>
              <div className='p-3 bg-violet-50 rounded-full text-violet-500 flex items-center justify-center text-xl w-11 h-11'>
                <AppstoreOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className='border-l-4 border-l-amber-500 bg-white rounded-lg shadow-sm border-slate-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Tổng đơn hàng</p>
                <h3 className='text-2xl font-bold text-slate-800 mt-2'>
                  {formatPrice(adminDashboardData.countOrders || 0)}
                </h3>
                <span className='text-[10px] text-slate-400'>Tổng các đơn hàng phát sinh</span>
              </div>
              <div className='p-3 bg-amber-50 rounded-full text-amber-500 flex items-center justify-center text-xl w-11 h-11'>
                <InboxOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className='shadow-sm border border-slate-100 rounded-lg h-full' bodyStyle={{ padding: 16 }}>
            <RevenueChart />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <TopProducts />
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboardScreen
