import { Button, Modal, Table, Tag, message } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { IExportWarehouse, IPayLoadListExportWarehouse } from './ExportWarehouse.props'
import { exportWarehouseServices } from './ExportWarehouseApis'
import { ExportWarehouseForm } from './components/ExportWarehouseForm'

const EXPORT_STATUS_OPTIONS = [
  { label: 'Hoàn thành', value: 'completed', color: 'green' },
  { label: 'Đã hủy', value: 'canceled', color: 'red' }
]

const getExportStatus = (status?: string) =>
  EXPORT_STATUS_OPTIONS.find((item) => item.value === status) || EXPORT_STATUS_OPTIONS[0]

export const ExportWarehousePage = () => {
  const [payload, setPayload] = useState<IPayLoadListExportWarehouse>({
    page: 1,
    limit: 10
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IExportWarehouse[]>([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [total, setTotal] = useState(0)

  const columnsListExportWarehouse = [
    {
      title: 'Tên nhà kho',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (value: any) => value?.warehouse_name
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (value: any) => value?.name
    },
    {
      title: 'Người xuất',
      dataIndex: 'staff_name',
      key: 'staff_name'
    },
    {
      title: 'Thời gian xuất',
      dataIndex: 'export_date',
      key: 'export_date',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (value: string) => value || '—'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => {
        const status = getExportStatus(value)
        return <Tag color={status.color}>{status.label}</Tag>
      }
    }
  ]

  const handleGetListExportWarehouse = useCallback(async () => {
    setLoading(true)
    try {
      const res = (await exportWarehouseServices.get(payload)) as any
      setData(res.data)
      setTotal(res?.meta?.item_count ?? res.data.length)
    } catch (error) {
      console.log('🚀 ~ handleGetListExportWarehouse ~ error:', error)
    } finally {
      setLoading(false)
    }
  }, [payload])

  useEffect(() => {
    handleGetListExportWarehouse()
  }, [handleGetListExportWarehouse])

  const handleSubmit = async (value: any) => {
    try {
      await exportWarehouseServices.post(value)
      message.success('Xuất hàng thành công')
      setIsOpenModal(false)
      handleGetListExportWarehouse()
    } catch (error) {
      console.log('🚀 ~ handleSubmit ~ error:', error)
      message.error('Xuất hàng thất bại')
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-semibold'>Xuất hàng</h1>
        <Button type='primary' icon={<ExportOutlined />} onClick={() => setIsOpenModal(true)}>
          Xuất hàng mới
        </Button>
      </div>

      <Table
        columns={columnsListExportWarehouse}
        dataSource={data}
        loading={loading}
        rowKey='id'
        pagination={{
          current: payload.page,
          pageSize: payload.limit,
          total: total,
          onChange: (page, pageSize) => {
            setPayload({
              ...payload,
              page,
              limit: pageSize
            })
          }
        }}
      />

      <Modal title='Xuất hàng mới' open={isOpenModal} onCancel={() => setIsOpenModal(false)} footer={null} width={1000}>
        <ExportWarehouseForm onFinish={handleSubmit} onClose={() => setIsOpenModal(false)} />
      </Modal>
    </div>
  )
}

export default ExportWarehousePage
