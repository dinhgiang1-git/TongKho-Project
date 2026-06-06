import { Button, Row, Spin, Modal, Table } from 'antd'
import FilterWarehouse from './components/FilterWarehouse'
import { useCallback, useEffect, useState } from 'react'
import { IColumnAntD } from 'common/constants/interface'
import { TooltipCustom } from 'common/components/tooltip/ToolTipComponent'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { ShowConfirm } from 'common/components/Alert'
import { Styled } from 'styles/stylesComponent'
import ModalComponent from 'common/components/modal/Modal'
import { getDataSource, openNotification } from 'common/utils'
import { AddEditWarehouse } from './components/AddEditWarehouse'
import { warehouseServices } from './warehouseApis'
import { IPayLoadLisWarehouse, IWarehouse } from './Warehouse.props'
import { useAuth } from 'hooks/useAuth'

function WarehousePage() {
  const [payload, setPayload] = useState<IPayLoadLisWarehouse>({
    page: 1,
    take: 10,
    q: '',
    status: 1,
    to_date: '',
    from_date: ''
  })
  const [warehouses, setWarehouses] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [count, setCount] = useState<number>(12)
  const [rowSelected, setRowSelected] = useState<IWarehouse>()
  const [inventoryModalVisible, setInventoryModalVisible] = useState<boolean>(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>()
  const { user } = useAuth()
  const columnsListWarehouse: IColumnAntD[] = [
    {
      title: 'STT',
      key: 'STT',
      dataIndex: 'STT',
      width: 20
    },
    {
      title: 'Mã kho',
      key: 'warehouse_code',
      dataIndex: 'warehouse_code'
    },
    {
      title: 'Tên kho',
      key: 'warehouse_name',
      dataIndex: 'warehouse_name'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      dataIndex: 'createdAt'
    },
    {
      width: 120,
      title: 'Thao tác',
      key: 'tt',
      dataIndex: 'tt',
      render: (value: number, record: any) => {
        return (
          <div style={{ display: 'flex' }}>
            <TooltipCustom
              title={'Xem chi tiết'}
              children={
                <Button
                  type={'text'}
                  className={'btn-info-text'}
                  icon={<EyeOutlined />}
                  onClick={() => handleViewInventory(record)}
                />
              }
            />
            {user?.role === 'admin' && (
              <TooltipCustom
                title={'Cập nhật'}
                children={
                  <Button
                    type={'text'}
                    className={'btn-success-text'}
                    icon={<EditOutlined />}
                    onClick={() => handleEditWarehouse(record)}
                  />
                }
              />
            )}
            {user?.role === 'admin' && (
              <ShowConfirm
                placement='bottomLeft'
                onConfirm={() => handleRemoveWarehouse(record)}
                confirmText={'Xóa'}
                title={'Bạn có chắc chắn muốn xóa?'}
              >
                <TooltipCustom
                  title='Xóa'
                  children={<Button type='text' className={'btn-delete-text'} icon={<DeleteOutlined />} />}
                />
              </ShowConfirm>
            )}
          </div>
        )
      }
    }
  ]

  const inventoryColumns = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 50
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (value: any) => value?.name || 'Sản phẩm không xác định'
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'quantity',
      key: 'quantity'
    }
  ]

  const handleViewInventory = (record: any) => {
    setSelectedWarehouse(record)
    setInventoryModalVisible(true)
  }

  const handleGetWarehouses = async (payload?: any) => {
    try {
      const res = await warehouseServices.get(payload)
      console.log('🚀 ~ handleGetWarehouses ~ res:', res)
      setWarehouses(getDataSource(res?.data, 1))
      setCount(res?.meta?.item_count)
    } catch (error) {
      console.log('🚀 ~ handleGetWarehouses ~ error:', error)
    }
  }

  useEffect(() => {
    handleGetWarehouses(payload)
  }, [payload])

  const handleFilter = useCallback(
    (value: any) => {
      if (value?.status !== null || value?.status !== undefined) {
        setPayload({
          ...payload,
          status: value.status,
          page: 1
        })
      }
      if (value?.date) {
        setPayload({
          ...payload,
          from_date: value?.date.split(',')[0],
          to_date: value?.date.split(',')[1]
        })
      }
      if (value?.search) {
        setPayload({
          ...payload,
          q: value?.search
        })
      }
    },
    [payload]
  )

  const handleSubmit = async (value: any) => {
    setIsLoading(true)
    const payLoadWarehouse = {
      id: rowSelected?.id,
      warehouse_name: value?.warehouse_name,
      warehouse_code: value?.warehouse_code,
      status: value?.status
    }
    let res
    try {
      if (rowSelected?.id) {
        res = await warehouseServices.patch(payLoadWarehouse)
      } else {
        res = await warehouseServices.post({ ...payLoadWarehouse })
      }

      if (res.status == 1) {
        if (rowSelected) {
          openNotification('success', 'Thành công', 'Cập nhật thành công')
        } else {
          openNotification('success', 'Thành công', 'Thêm mới thành công')
        }
        setIsLoading(false)
        setModalVisible(false)
        handleGetWarehouses()
      }
    } catch (error) {
      console.log('🚀 ~ handleSubmit ~ error:', error)
    }
  }

  const handleEditWarehouse = useCallback(async (record: any) => {
    setModalVisible(true)
    setRowSelected(record)
  }, [])

  const handleRemoveWarehouse = useCallback(async (record: any) => {
    try {
      const res = await warehouseServices.delete(record?.id)
      if (res) {
        openNotification('success', 'Thành công', 'Xóa kho thành công')
        setIsLoading(true)
        handleGetWarehouses()
        setIsLoading(false)
      }
    } catch (error) {
      console.log('🚀 ~ handleRemoveWarehouse ~ error:', error)
    }
  }, [])

  const handleClose = useCallback(() => {
    setModalVisible(false)
    setRowSelected(undefined)
  }, [])

  return (
    <>
      <Row gutter={[15, 6]} className='mb-2'>
        <FilterWarehouse onChangeValue={handleFilter} />
      </Row>
      <Row className='mb-2 flex justify-end'>
        {user?.role === 'admin' && (
          <Button
            type='primary'
            onClick={() => {
              setModalVisible(true)
              setTitle('Thêm mới kho')
            }}
          >
            Thêm mới
          </Button>
        )}
      </Row>
      <Spin spinning={isLoading}>
        <Styled.TableStyle
          bordered
          columns={columnsListWarehouse}
          dataSource={warehouses}
          pagination={{
            onChange: (page) => {
              setIsLoading(true)
              setTimeout(() => {
                setPayload({ ...payload, page: page })
                setIsLoading(false)
              }, 200)
            },
            total: count,
            current: payload.page,
            pageSize: payload.take
          }}
        />
      </Spin>
      <ModalComponent
        loading={isLoading}
        title={title}
        width={500}
        modalVisible={modalVisible}
        children={<AddEditWarehouse onFinish={handleSubmit} onClose={handleClose} rowSelected={rowSelected} />}
      />
      <Modal
        title={`Chi tiết tồn kho - ${selectedWarehouse?.warehouse_name}`}
        open={inventoryModalVisible}
        onCancel={() => setInventoryModalVisible(false)}
        width={800}
        footer={null}
      >
        <Table
          columns={inventoryColumns}
          dataSource={getDataSource(selectedWarehouse?.product_warehouses || [], 1)}
          pagination={false}
          loading={isLoading}
        />
      </Modal>
    </>
  )
}

export default WarehousePage
