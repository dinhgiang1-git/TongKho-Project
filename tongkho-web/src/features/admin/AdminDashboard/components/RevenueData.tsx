import React, { useCallback, useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminDashboardServices } from '../adminDashboardApis'

const RevenueChart = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<string>([])
  console.log('🚀 ~ RevenueChart ~ data:', data)

  const listYear = ['2021', '2022', '2023', '2024', '2025', '2026', '2027']

  const getRevenueByYear = useCallback(
    async (selectedYear: number) => {
      try {
        const res = await adminDashboardServices.getRevenueByYear(selectedYear)
        if (res) {
          setData(res.data.monthlyRevenue)
        }
      } catch (error) {
        console.log('🚀 ~ getAdminDashboarData ~ error:', error)
      }
    },
    [selectedYear]
  )

  useEffect(() => {
    getRevenueByYear(selectedYear)
  }, [selectedYear])

  return (
    <div className='bg-white  rounded-lg p-6'>
      <h2 className='text-2xl font-bold text-center mb-6 text-gray-700'>📈 Thống kê doanh thu</h2>

      {/* Bộ lọc chọn năm */}
      <div className='flex justify-center mb-4'>
        <select
          className='p-2 border rounded-md text-lg font-semibold cursor-pointer'
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {listYear.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#ff4e50' stopOpacity={0.8} />
              <stop offset='100%' stopColor='#fc913a' stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#ddd' />
          <XAxis dataKey='month' stroke='#666' tick={{ fontSize: 14 }} />
          <YAxis stroke='#666' tick={{ fontSize: 14 }} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className='bg-gray-900 text-white p-3 rounded-lg shadow-lg'>
                  <p className='font-bold'>Tháng: {payload[0].payload.month}</p>
                  <p>Doanh thu: {payload[0].value.toLocaleString()}VNĐ</p>
                </div>
              ) : null
            }
          />
          <Line
            type='monotone'
            dataKey='revenue'
            stroke='url(#revenueGradient)'
            strokeWidth={4}
            dot={{ r: 6, fill: '#ff4e50', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, fill: '#fc913a', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
