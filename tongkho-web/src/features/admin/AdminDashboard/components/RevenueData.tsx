import { useCallback, useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminDashboardServices } from '../adminDashboardApis'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-lg bg-slate-900/95 backdrop-blur-sm p-4 text-xs text-white shadow-xl border border-slate-700/50 min-w-[180px]'>
        <div className='font-bold text-slate-300 border-b border-slate-700/80 pb-1.5 mb-2'>
          {payload[0].payload.month}
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='flex items-center gap-1.5 text-slate-400'>
            <span className='w-2 h-2 rounded-full bg-blue-400' />
            Doanh thu:
          </span>
          <span className='font-semibold text-slate-100'>{moneyFormatter.format(payload[0].value)}</span>
        </div>
      </div>
    )
  }
  return null
}

const RevenueChart = () => {
  const currentYear = new Date().getFullYear()
  const [data, setData] = useState<any[]>([])

  const getRevenueByYear = useCallback(async (yearValue: number) => {
    try {
      const res = await adminDashboardServices.getRevenueByYear(yearValue)
      if (res) {
        setData(res.data.monthlyRevenue)
      }
    } catch (error) {
      console.log('🚀 ~ getAdminDashboarData ~ error:', error)
    }
  }, [])

  useEffect(() => {
    getRevenueByYear(currentYear)
  }, [currentYear, getRevenueByYear])

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4 border-b pb-3'>
        <div>
          <h3 className='text-base font-bold text-slate-800 m-0'>Doanh thu năm {currentYear}</h3>
          <p className='text-xs text-slate-500 mt-0.5'>Xu hướng doanh thu theo tháng để nắm nhanh nhịp bán hàng.</p>
        </div>
        <span className='rounded border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600'>
          Năm hiện tại
        </span>
      </div>

      <ResponsiveContainer width='100%' height={260}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id='revenueLineGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
          <XAxis dataKey='month' stroke='#94a3b8' tickLine={false} axisLine={false} dy={8} />
          <YAxis
            stroke='#3b82f6'
            tickLine={false}
            axisLine={false}
            dx={-8}
            tickFormatter={(value) => numberFormatter.format(Number(value) / 1000000) + 'tr'}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type='monotone'
            dataKey='revenue'
            name='Doanh thu (VND)'
            stroke='#3b82f6'
            strokeWidth={3}
            dot={{ r: 5, fill: '#3b82f6', strokeWidth: 1.5, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
