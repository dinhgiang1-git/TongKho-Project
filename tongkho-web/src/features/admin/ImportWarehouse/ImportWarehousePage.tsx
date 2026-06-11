import { Button, Modal, Select, Table, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import { IImportWarehouse, IPayLoadListImportWarehouse } from './ImportWarehouse.props'
import { importWarehouseServices } from './ImportWarehouseApis'
import { ImportWarehouseForm } from './components/ImportWarehouseForm'
import dayjs from 'dayjs'

const IMPORT_STATUS_OPTIONS = [
  { label: 'Đang xử lý', value: 'processing', color: 'gold' },
  { label: 'Hoàn thành', value: 'completed', color: 'green' },
  { label: 'Đã hủy', value: 'canceled', color: 'red' }
]

const getImportStatus = (status?: string) =>
  IMPORT_STATUS_OPTIONS.find((item) => item.value === status) || IMPORT_STATUS_OPTIONS[0]

export const ImportWarehousePage = () => {
  const [payload, setPayload] = useState<IPayLoadListImportWarehouse>({
    page: 1,
    limit: 10
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IImportWarehouse[]>([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [total, setTotal] = useState(0)

  const columnsListImportWarehouse = [
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
      title: 'Người nhập',
      dataIndex: 'staff_name',
      key: 'staff_name'
    },
    {
      title: 'Thời gian nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'quantity',
      key: 'quantity'
      // render: (value: any[]) => value.length
    }
  ]

  const handleGetListImportWarehouse = useCallback(async () => {
    setLoading(true)
    try {
      const res = await importWarehouseServices.get(payload)
      console.log('🚀 ~ handleGetListImportWarehouse ~ res:', res)
      setData(res.data)
      setTotal(res.data.length)
    } catch (error) {
      console.log('🚀 ~ handleGetListImportWarehouse ~ error:', error)
    } finally {
      setLoading(false)
    }
  }, [payload])

  useEffect(() => {
    handleGetListImportWarehouse()
  }, [handleGetListImportWarehouse])

  const handleSubmit = async (value: any) => {
    try {
      await importWarehouseServices.post(value)
      message.success('Nhập kho thành công')
      setIsOpenModal(false)
      handleGetListImportWarehouse()
    } catch (error) {
      console.log('🚀 ~ handleSubmit ~ error:', error)
      message.error('Nhập kho thất bại')
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    const statusOption = getImportStatus(status)

    try {
      await importWarehouseServices.updateStatus(id, status)
      message.success(`Đã cập nhật trạng thái: ${statusOption.label}`)
      handleGetListImportWarehouse()
    } catch (error) {
      console.log('🚀 ~ handleUpdateStatus ~ error:', error)
      message.error('Cập nhật trạng thái thất bại')
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-semibold'>Nhập kho</h1>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsOpenModal(true)}>
          Nhập kho mới
        </Button>
      </div>

      <Table
        columns={columnsListImportWarehouse}
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

      <Modal title='Nhập kho mới' open={isOpenModal} onCancel={() => setIsOpenModal(false)} footer={null} width={1000}>
        <ImportWarehouseForm onFinish={handleSubmit} onClose={() => setIsOpenModal(false)} />
      </Modal>
    </div>
  )
}

export default ImportWarehousePage
