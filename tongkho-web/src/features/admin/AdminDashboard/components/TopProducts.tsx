import { useCallback, useEffect, useState } from 'react'
import { Card, Empty, Image, Spin, Table } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { adminDashboardServices } from '../adminDashboardApis'
import { getDataSource } from 'common/utils'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

interface TopProduct {
  id: number
  name: string
  product_code: string
  price: number
  image: string
  total_quantity: number | null
  total_revenue: number | null
}

const TopProducts = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TopProduct[]>([])
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const columns = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 50,
      align: 'center' as const
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 65,
      align: 'center' as const,
      render: (value: string) => (
        <Image
          src={value}
          width={34}
          height={34}
          className='object-cover rounded border border-slate-200'
          fallback='https://via.placeholder.com/80x80?text=SP'
          preview={{ mask: <span className='text-[8px]'>Xem</span> }}
        />
      )
    },
    {
      title: 'Sản phẩm',
      key: 'product_info',
      render: (_value: any, record: TopProduct) => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-semibold text-slate-700 text-xs truncate max-w-[150px]' title={record.name}>
            {record.name}
          </span>
          <span className='font-mono text-[10px] text-slate-400'>{record.product_code}</span>
        </div>
      )
    },
    {
      title: 'Đã bán',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 70,
      align: 'right' as const,
      render: (value: number | null) => (
        <span className='font-semibold text-emerald-600 text-xs'>{numberFormatter.format(value || 0)}</span>
      )
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'right' as const,
      render: (value: number | null) => (
        <span className='font-bold text-indigo-600 text-xs'>{moneyFormatter.format(value || 0)}</span>
      )
    }
  ]

  const getTopProducts = useCallback(async () => {
    try {
      setLoading(true)
      const apiRes = await adminDashboardServices.getTopProducts({
        year: currentYear,
        month: currentMonth,
        limit: 5
      })
      if (apiRes?.data) {
        setData(getDataSource(apiRes.data, 1))
      }
    } catch (error) {
      console.log('🚀 ~ getTopProducts ~ error:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    getTopProducts()
  }, [getTopProducts])

  return (
    <Card className='shadow-sm border border-slate-100 rounded-lg h-full' bodyStyle={{ padding: '16px' }}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-3'>
        <div>
          <h3 className='text-base font-bold text-slate-800 m-0 flex items-center gap-1.5'>
            <TrophyOutlined className='text-amber-500' /> Bán chạy tháng này
          </h3>
          <p className='mt-1 text-xs text-slate-500'>Top 5 sản phẩm theo doanh thu trong tháng {currentMonth}.</p>
        </div>
      </div>
      <Spin spinning={loading}>
        {data.length ? (
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            size='small'
            rowKey='id'
            scroll={{ x: 300 }}
            className='compact-table'
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có dữ liệu tháng này' />
        )}
      </Spin>
    </Card>
  )
}

export default TopProducts
