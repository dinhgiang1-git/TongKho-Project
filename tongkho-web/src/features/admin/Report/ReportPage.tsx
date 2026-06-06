import {
  ReloadOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  BoxPlotOutlined,
  SearchOutlined,
  FilePdfOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  DatePicker,
  Segmented,
  Image,
  Modal,
  Checkbox,
  Radio
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, Legend, ComposedChart } from 'recharts'
import dayjs from 'dayjs'
import { reportServices } from './ReportApis'

interface RevenuePoint {
  period: string
  label: string
  revenue: number
  order_count: number
}

interface ProductReportItem {
  id: number
  name: string
  product_code: string
  price: number
  current_quantity: number
  category_name: string
  total_quantity: number
  total_revenue: number
  order_count: number
}

interface SalesReportFilter {
  filter_type: 'all' | 'custom'
  from_date: string
  to_date: string
  limit: number
}

interface SalesReportData {
  filter: {
    filter_type: 'all' | 'custom'
    from_date: string
    to_date: string
    group_by: string
  }
  summary: {
    total_revenue: number
    order_count: number
    average_order_value: number
    total_quantity: number
    sold_product_count: number
  }
  revenue_series: RevenuePoint[]
  top_products: ProductReportItem[]
}

interface ExportConfig {
  title: string
  reporter: string
  showKpis: boolean
  showChart: boolean
  showTable: boolean
  orientation: 'portrait' | 'landscape'
  columns: {
    image: boolean
    product_code: boolean
    name: boolean
    category_name: boolean
    total_quantity: boolean
    order_count: boolean
    current_quantity: boolean
    total_revenue: boolean
  }
}

const formatDateParam = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')

const getCurrentMonthRange = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    from_date: formatDateParam(firstDay),
    to_date: formatDateParam(today)
  }
}

const getDefaultFilter = (): SalesReportFilter => {
  return {
    filter_type: 'all',
    from_date: '',
    to_date: '',
    limit: 10
  }
}

const defaultExportConfig = (): ExportConfig => ({
  title: 'BÁO CÁO DOANH THU & SẢN PHẨM BÁN RA',
  reporter: 'Ban Quản Trị - Kim Khí Minh Ngọc',
  showKpis: true,
  showChart: true,
  showTable: true,
  orientation: 'landscape',
  columns: {
    image: true,
    product_code: true,
    name: true,
    category_name: true,
    total_quantity: true,
    order_count: true,
    current_quantity: true,
    total_revenue: true
  }
})

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
          {payload[0].payload.label}
        </div>
        <div className='space-y-1.5'>
          {payload.map((item: any) => {
            const isRevenue = item.dataKey === 'revenue'
            const color = isRevenue ? '#38bdf8' : '#34d399'
            const name = isRevenue ? 'Doanh thu' : 'Số đơn'
            const formattedVal = isRevenue
              ? moneyFormatter.format(item.value)
              : numberFormatter.format(item.value) + ' đơn'

            return (
              <div key={item.dataKey} className='flex items-center justify-between gap-4'>
                <span className='flex items-center gap-1.5 text-slate-400'>
                  <span className='w-2 h-2 rounded-full' style={{ backgroundColor: color }} />
                  {name}:
                </span>
                <span className='font-semibold text-slate-100'>{formattedVal}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

function ReportPage() {
  const [filter, setFilter] = useState<SalesReportFilter>(getDefaultFilter)
  const [data, setData] = useState<SalesReportData>()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [chartView, setChartView] = useState<'revenue' | 'orders' | 'both'>('both')

  // PDF Export Configurations
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportConfig, setExportConfig] = useState<ExportConfig>(defaultExportConfig)

  const columns: ColumnsType<ProductReportItem> = useMemo(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 60,
        align: 'center',
        render: (_value, _record, index) => index + 1
      },
      {
        title: 'Ảnh',
        dataIndex: 'image',
        key: 'image',
        width: 80,
        align: 'center',
        render: (value: string) => (
          <Image
            src={value}
            width={40}
            height={40}
            className='object-cover rounded-md border border-slate-200'
            fallback='https://via.placeholder.com/100x100?text=SP'
            preview={{ mask: <span className='text-[10px]'>Xem</span> }}
          />
        )
      },
      {
        title: 'Mã sản phẩm',
        dataIndex: 'product_code',
        key: 'product_code',
        width: 130,
        render: (value: string) => (
          <Tag color='blue' className='font-mono m-0'>
            {value}
          </Tag>
        )
      },
      {
        title: 'Tên sản phẩm',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true
      },
      {
        title: 'Danh mục',
        dataIndex: 'category_name',
        key: 'category_name',
        render: (value: string) => value || <span className='text-slate-400 italic'>Chưa phân loại</span>
      },
      {
        title: 'Số lượng bán',
        dataIndex: 'total_quantity',
        key: 'total_quantity',
        align: 'right',
        width: 130,
        sorter: (a, b) => (a.total_quantity || 0) - (b.total_quantity || 0),
        render: (value: number) => (
          <span className='font-bold text-emerald-600'>{numberFormatter.format(value || 0)}</span>
        )
      },
      {
        title: 'Số đơn',
        dataIndex: 'order_count',
        key: 'order_count',
        align: 'right',
        width: 100,
        sorter: (a, b) => (a.order_count || 0) - (b.order_count || 0),
        render: (value: number) => numberFormatter.format(value || 0)
      },
      {
        title: 'Tồn hiện tại',
        dataIndex: 'current_quantity',
        key: 'current_quantity',
        align: 'right',
        width: 120,
        sorter: (a, b) => (a.current_quantity || 0) - (b.current_quantity || 0),
        render: (value: number) => {
          if (value <= 0) return <Tag color='red'>Hết hàng</Tag>
          if (value < 10)
            return <span className='text-amber-500 font-semibold'>{numberFormatter.format(value)} (Sắp hết)</span>
          return numberFormatter.format(value)
        }
      },
      {
        title: 'Doanh thu',
        dataIndex: 'total_revenue',
        key: 'total_revenue',
        align: 'right',
        width: 150,
        sorter: (a, b) => (a.total_revenue || 0) - (b.total_revenue || 0),
        render: (value: number) => (
          <span className='font-bold text-indigo-600'>{moneyFormatter.format(value || 0)}</span>
        )
      }
    ],
    []
  )

  // Filter columns dynamically based on configuration
  const activeColumns = useMemo(() => {
    return columns.filter((col) => {
      const key = col.key as string
      if (key && key in exportConfig.columns) {
        return exportConfig.columns[key as keyof typeof exportConfig.columns]
      }
      return true
    })
  }, [columns, exportConfig])

  const getSalesReport = useCallback(async () => {
    try {
      setLoading(true)
      const apiFilter = {
        ...filter,
        limit: filter.limit === 0 ? undefined : filter.limit
      }
      const res = await reportServices.getSalesReport(apiFilter)
      setData(res?.data)
    } catch (error) {
      console.log('🚀 ~ getSalesReport ~ error:', error)
      setData(undefined)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    getSalesReport()
  }, [getSalesReport])

  const handleFilterChange = (key: keyof typeof filter, value: string | number) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTimeFilterChange = (value: 'all' | 'custom') => {
    setFilter((prev) => ({
      ...prev,
      filter_type: value,
      ...(value === 'all' ? { from_date: '', to_date: '' } : getCurrentMonthRange())
    }))
  }

  const filteredProducts = useMemo(() => {
    const list = data?.top_products || []
    if (!searchText) return list
    const q = searchText.toLowerCase().trim()
    return list.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.product_code || '').toLowerCase().includes(q) ||
        (item.category_name || '').toLowerCase().includes(q)
    )
  }, [data?.top_products, searchText])

  const handleExportPdf = () => {
    setExportModalVisible(true)
  }

  return (
    <div id='printable-report-area' className='space-y-6 w-full'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: ${exportConfig.orientation};
            margin: 15mm;
          }
          
          /* Hide general admin wrapper components */
          aside, header, nav, .ant-layout-sider, .ant-layout-header, .no-print, .ant-btn, .ant-select, .ant-picker, .ant-segmented, .ant-input-affix-wrapper, .ant-modal-root {
            display: none !important;
          }
          
          body, html, #root, .ant-layout, .ant-layout-content {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Show print-only elements */
          .print-only {
            display: block !important;
          }
          
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          .ant-card {
            border: none !important;
            box-shadow: none !important;
            margin-bottom: 25px !important;
            padding: 0 !important;
          }
          
          .recharts-responsive-container {
            width: 100% !important;
            height: 300px !important;
          }
          
          .ant-table-wrapper {
            width: 100% !important;
          }
          .ant-table {
            font-size: 11px !important;
          }
          .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
            padding: 6px 8px !important;
          }
          
          .ant-card, .recharts-responsive-container, tr {
            page-break-inside: avoid;
          }
        }
      `
        }}
      />

      {/* Print-only Header */}
      <div className='hidden print-only mb-6 border-b pb-4'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-xl font-bold text-slate-800 uppercase'>{exportConfig.title}</h1>
            <p className='text-[10px] text-slate-400 mt-0.5'>Hệ thống quản lý Tổng Kho Kim Khí Minh Ngọc</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-slate-600'>
              Người lập biểu: <span className='font-semibold text-slate-800'>{exportConfig.reporter}</span>
            </p>
            <p className='text-[10px] text-slate-400 mt-0.5'>Ngày lập: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
          </div>
        </div>
        <p className='text-xs text-slate-700 mt-4 font-semibold'>
          Khoảng thời gian thống kê:{' '}
          {filter.filter_type === 'all'
            ? 'Tất cả thời gian'
            : `Từ ngày ${dayjs(filter.from_date).format('DD/MM/YYYY')} đến ngày ${dayjs(filter.to_date).format('DD/MM/YYYY')}`}
        </p>
      </div>

      {/* Filters Card */}
      <Card className='shadow-sm border border-slate-100 rounded-lg no-print'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
              <RiseOutlined className='text-blue-500' /> Báo cáo chuyên sâu
            </h2>
            <p className='mt-1 text-xs text-slate-500'>
              Phân tích doanh thu, đơn hàng và hiệu suất sản phẩm theo khoảng thời gian, bảng chi tiết và cấu hình xuất
              PDF.
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-3.5'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-slate-500'>Thời gian</span>
              <Select
                className='w-36'
                value={filter.filter_type}
                onChange={handleTimeFilterChange}
                disabled={loading}
                options={[
                  { label: 'Tất cả thời gian', value: 'all' },
                  { label: 'Tùy chỉnh ngày', value: 'custom' }
                ]}
              />
            </div>

            {filter.filter_type === 'custom' && (
              <>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs font-semibold text-slate-500'>Từ ngày</span>
                  <DatePicker
                    className='w-36'
                    disabled={loading}
                    format='DD/MM/YYYY'
                    value={filter.from_date ? dayjs(filter.from_date) : null}
                    onChange={(date) => {
                      handleFilterChange('from_date', date ? date.format('YYYY-MM-DD') : '')
                    }}
                    allowClear={false}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs font-semibold text-slate-500'>Đến ngày</span>
                  <DatePicker
                    className='w-36'
                    disabled={loading}
                    format='DD/MM/YYYY'
                    value={filter.to_date ? dayjs(filter.to_date) : null}
                    onChange={(date) => {
                      handleFilterChange('to_date', date ? date.format('YYYY-MM-DD') : '')
                    }}
                    allowClear={false}
                  />
                </div>
              </>
            )}

            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-slate-500'>Top sản phẩm</span>
              <Select
                className='w-32'
                value={filter.limit}
                onChange={(value) => handleFilterChange('limit', value)}
                disabled={loading}
                options={[
                  { label: 'Top 5', value: 5 },
                  { label: 'Top 10', value: 10 },
                  { label: 'Top 20', value: 20 },
                  { label: 'Top 50', value: 50 },
                  { label: 'Tất cả sản phẩm', value: 0 }
                ]}
              />
            </div>

            <Button
              type='primary'
              icon={<ReloadOutlined spin={loading} />}
              loading={loading}
              onClick={getSalesReport}
              className='h-8'
            >
              Tải lại
            </Button>
          </div>
        </div>
      </Card>

      <Spin spinning={loading} size='large'>
        {/* KPI Cards */}
        <Row gutter={[16, 16]} className={exportConfig.showKpis ? '' : 'print:hidden'}>
          <Col xs={24} sm={12} xl={6}>
            <Card className='hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500 bg-white rounded-lg shadow-sm border-slate-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Doanh thu</p>
                  <h3 className='text-2xl font-bold text-slate-800 mt-1'>
                    {moneyFormatter.format(data?.summary.total_revenue || 0)}
                  </h3>
                  <span className='text-[10px] text-slate-400'>Tổng thu đơn hoàn thành</span>
                </div>
                <div className='p-3 bg-blue-50 rounded-full text-blue-500 flex items-center justify-center text-xl w-11 h-11 no-print'>
                  <DollarOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className='hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-emerald-500 bg-white rounded-lg shadow-sm border-slate-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Đơn hoàn thành</p>
                  <h3 className='text-2xl font-bold text-slate-800 mt-1'>
                    {numberFormatter.format(data?.summary.order_count || 0)}
                  </h3>
                  <span className='text-[10px] text-slate-400'>Tổng số đơn giao thành công</span>
                </div>
                <div className='p-3 bg-emerald-50 rounded-full text-emerald-500 flex items-center justify-center text-xl w-11 h-11 no-print'>
                  <ShoppingCartOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className='hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-violet-500 bg-white rounded-lg shadow-sm border-slate-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Giá trị đơn TB</p>
                  <h3 className='text-2xl font-bold text-slate-800 mt-1'>
                    {moneyFormatter.format(data?.summary.average_order_value || 0)}
                  </h3>
                  <span className='text-[10px] text-slate-400'>Giá trị trung bình mỗi đơn</span>
                </div>
                <div className='p-3 bg-violet-50 rounded-full text-violet-500 flex items-center justify-center text-xl w-11 h-11 no-print'>
                  <RiseOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className='hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-500 bg-white rounded-lg shadow-sm border-slate-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Sản phẩm đã bán</p>
                  <h3 className='text-2xl font-bold text-slate-800 mt-1'>
                    {numberFormatter.format(data?.summary.total_quantity || 0)}
                  </h3>
                  <div className='mt-1.5 flex items-center gap-1.5'>
                    <span className='text-[10px] text-slate-400'>Số loại SP:</span>
                    <Tag color='warning' className='m-0 text-[10px] py-0 px-1.5 font-bold leading-tight'>
                      {numberFormatter.format(data?.summary.sold_product_count || 0)}
                    </Tag>
                  </div>
                </div>
                <div className='p-3 bg-amber-50 rounded-full text-amber-500 flex items-center justify-center text-xl w-11 h-11 no-print'>
                  <BoxPlotOutlined />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Chart Card */}
        <Card
          className={`mt-6 shadow-sm rounded-lg border border-slate-100 ${exportConfig.showChart ? '' : 'print:hidden'}`}
        >
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='text-lg font-bold text-slate-800'>Xu hướng kinh doanh</h3>
              <p className='text-xs text-slate-500 mt-0.5'>
                Biểu đồ thống kê theo {data?.filter.group_by === 'month' ? 'tháng' : 'ngày'}
              </p>
            </div>
            <div className='flex items-center gap-3 self-end sm:self-auto no-print'>
              <Segmented
                value={chartView}
                onChange={(value: any) => setChartView(value)}
                options={[
                  { label: 'Doanh thu', value: 'revenue' },
                  { label: 'Số đơn', value: 'orders' },
                  { label: 'Cả hai', value: 'both' }
                ]}
              />
            </div>
          </div>

          {(data?.revenue_series?.length || 0) > 0 ? (
            <ResponsiveContainer width='100%' height={380}>
              <ComposedChart data={data?.revenue_series || []} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id='reportRevenueGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#0ea5e9' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='#0ea5e9' stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id='reportOrdersGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                <XAxis dataKey='label' stroke='#94a3b8' tickLine={false} axisLine={false} dy={8} />

                {/* Left Y-Axis: Revenue */}
                {(chartView === 'revenue' || chartView === 'both') && (
                  <YAxis
                    yAxisId='left'
                    stroke='#0ea5e9'
                    tickLine={false}
                    axisLine={false}
                    dx={-8}
                    tickFormatter={(value) => numberFormatter.format(Number(value) / 1000000) + 'tr'}
                  />
                )}

                {/* Right Y-Axis: Orders */}
                {chartView === 'orders' && (
                  <YAxis
                    yAxisId='left'
                    stroke='#10b981'
                    tickLine={false}
                    axisLine={false}
                    dx={-8}
                    tickFormatter={(value) => numberFormatter.format(value)}
                  />
                )}
                {chartView === 'both' && (
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#10b981'
                    tickLine={false}
                    axisLine={false}
                    dx={8}
                    tickFormatter={(value) => numberFormatter.format(value)}
                  />
                )}

                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign='top' height={36} iconType='circle' />

                {/* Render Series based on view */}
                {chartView === 'revenue' && (
                  <Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='revenue'
                    name='Doanh thu (VND)'
                    stroke='#0ea5e9'
                    strokeWidth={2.5}
                    fill='url(#reportRevenueGradient)'
                  />
                )}

                {chartView === 'orders' && (
                  <Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='order_count'
                    name='Số đơn hàng'
                    stroke='#10b981'
                    strokeWidth={2.5}
                    fill='url(#reportOrdersGradient)'
                  />
                )}

                {chartView === 'both' && (
                  <>
                    <Area
                      yAxisId='left'
                      type='monotone'
                      dataKey='revenue'
                      name='Doanh thu (VND)'
                      stroke='#0ea5e9'
                      strokeWidth={2}
                      fill='url(#reportRevenueGradient)'
                    />
                    <Line
                      yAxisId='right'
                      type='monotone'
                      dataKey='order_count'
                      name='Số đơn hàng'
                      stroke='#10b981'
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <Empty description='Không có dữ liệu doanh thu' />
          )}
        </Card>

        {/* Table Card */}
        <Card
          className={`mt-6 shadow-sm rounded-lg border border-slate-100 ${exportConfig.showTable ? '' : 'print:hidden'}`}
        >
          <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2.5'>
              <h3 className='text-lg font-bold text-slate-800 m-0'>Chi tiết sản phẩm bán ra</h3>
              {filter.limit > 0 && (
                <Tag color='blue' className='m-0 no-print'>
                  Top {filter.limit}
                </Tag>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-3'>
              <Input
                placeholder='Tìm mã, tên sản phẩm hoặc danh mục...'
                prefix={<SearchOutlined className='text-slate-400' />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className='w-full sm:w-64 no-print'
                allowClear
              />
              <Button
                type='primary'
                icon={<FilePdfOutlined />}
                disabled={!filteredProducts?.length}
                onClick={handleExportPdf}
                className='w-full sm:w-auto no-print'
              >
                Xuất PDF
              </Button>
            </div>
          </div>
          <Table
            bordered
            rowKey='id'
            columns={activeColumns}
            dataSource={filteredProducts}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} sản phẩm`
            }}
            scroll={{ x: 1000 }}
            className='custom-table'
          />
        </Card>
      </Spin>

      {/* Export Configuration Form Modal */}
      <Modal
        title={
          <div className='text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2'>
            <FilePdfOutlined className='text-red-500' /> Cấu hình xuất báo cáo PDF
          </div>
        }
        open={exportModalVisible}
        onOk={() => {
          setExportModalVisible(false)
          setTimeout(() => {
            window.print()
          }, 350)
        }}
        onCancel={() => setExportModalVisible(false)}
        okText='Bắt đầu xuất PDF'
        cancelText='Hủy bỏ'
        width={650}
        className='no-print'
      >
        <div className='py-4 space-y-4 text-xs text-slate-600'>
          <Row gutter={24}>
            {/* Left side: General configs */}
            <Col span={13} className='space-y-4 border-r pr-4 border-slate-100'>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-slate-700'>Tiêu đề báo cáo</span>
                <Input
                  value={exportConfig.title}
                  onChange={(e) => setExportConfig((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder='Nhập tiêu đề...'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-slate-700'>Người lập biểu</span>
                <Input
                  value={exportConfig.reporter}
                  onChange={(e) => setExportConfig((prev) => ({ ...prev, reporter: e.target.value }))}
                  placeholder='Tên người lập...'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <span className='font-semibold text-slate-700'>Các phần muốn hiển thị</span>
                <div className='flex flex-wrap gap-x-4 gap-y-2 mt-1'>
                  <Checkbox
                    checked={exportConfig.showKpis}
                    onChange={(e) => setExportConfig((prev) => ({ ...prev, showKpis: e.target.checked }))}
                  >
                    Thẻ thống kê
                  </Checkbox>
                  <Checkbox
                    checked={exportConfig.showChart}
                    onChange={(e) => setExportConfig((prev) => ({ ...prev, showChart: e.target.checked }))}
                  >
                    Biểu đồ xu hướng
                  </Checkbox>
                  <Checkbox
                    checked={exportConfig.showTable}
                    onChange={(e) => setExportConfig((prev) => ({ ...prev, showTable: e.target.checked }))}
                  >
                    Bảng sản phẩm
                  </Checkbox>
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <span className='font-semibold text-slate-700'>Hướng giấy in</span>
                <Radio.Group
                  value={exportConfig.orientation}
                  onChange={(e) => setExportConfig((prev) => ({ ...prev, orientation: e.target.value }))}
                  className='mt-1'
                >
                  <Radio value='portrait'>Khổ dọc (Portrait)</Radio>
                  <Radio value='landscape'>Khổ ngang (Landscape)</Radio>
                </Radio.Group>
              </div>
            </Col>

            {/* Right side: Table columns choices */}
            <Col span={11} className='space-y-3 pl-2'>
              <span className='font-semibold text-slate-700 block mb-1'>Cột hiển thị bảng sản phẩm</span>
              <div className='space-y-2 flex flex-col'>
                <Checkbox
                  checked={exportConfig.columns.image}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, image: e.target.checked }
                    }))
                  }
                >
                  Ảnh sản phẩm
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.product_code}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, product_code: e.target.checked }
                    }))
                  }
                >
                  Mã sản phẩm
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.name}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, name: e.target.checked }
                    }))
                  }
                >
                  Tên sản phẩm
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.category_name}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, category_name: e.target.checked }
                    }))
                  }
                >
                  Danh mục
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.total_quantity}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, total_quantity: e.target.checked }
                    }))
                  }
                >
                  Số lượng bán
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.order_count}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, order_count: e.target.checked }
                    }))
                  }
                >
                  Số đơn hàng
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.current_quantity}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, current_quantity: e.target.checked }
                    }))
                  }
                >
                  Tồn hiện tại
                </Checkbox>
                <Checkbox
                  checked={exportConfig.columns.total_revenue}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      columns: { ...prev.columns, total_revenue: e.target.checked }
                    }))
                  }
                >
                  Doanh thu
                </Checkbox>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  )
}

export default ReportPage
