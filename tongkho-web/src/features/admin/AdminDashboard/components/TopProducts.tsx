import React, { useCallback, useEffect, useState } from 'react'
import { Table, Select, Card, Spin } from 'antd'
import { adminDashboardServices } from '../adminDashboardApis'
import { formatPrice, getDataSource } from 'common/utils'

const { Option } = Select

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
  const [filter, setFilter] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })

  const columns = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 50
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'product_code',
      key: 'product_code',
      render: (text: string) => <span className='font-medium'>{text}</span>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className='font-medium'>{text}</span>
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => <span className='text-blue-600 font-semibold'>{formatPrice(value)}</span>
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      render: (value: number | null) => <span className='text-green-600 font-semibold'>{value || 0}</span>
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value: number | null) => <span className='text-purple-600 font-semibold'>{formatPrice(value || 0)}</span>
    }
  ]

  const getTopProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminDashboardServices.getTopProducts(filter)
      if (res?.data) {
        setData(getDataSource(res.data, 1))
      }
    } catch (error) {
      console.log('🚀 ~ getTopProducts ~ error:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    getTopProducts()
  }, [filter])

  const handleFilterChange = (type: 'year' | 'month', value: number) => {
    setFilter((prev) => ({ ...prev, [type]: value }))
  }

  return (
    <Card className='shadow-lg rounded-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold text-gray-700'>🏆 Sản phẩm bán chạy</h2>
        <div className='flex gap-4'>
          <Select value={filter.year} onChange={(value) => handleFilterChange('year', value)} className='w-32'>
            {Array.from({ length: 5 }, (_, i) => (
              <Option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </Option>
            ))}
          </Select>
          <Select value={filter.month} onChange={(value) => handleFilterChange('month', value)} className='w-32'>
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} pagination={false} className='mt-4' rowKey='id' />
      </Spin>
    </Card>
  )
}

export default TopProducts
