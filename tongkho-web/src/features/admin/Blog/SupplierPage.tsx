/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Row, Spin } from 'antd'
import FilterSupplier from './components/FilterSupplier'
import { TooltipCustom } from 'common/components/tooltip/ToolTipComponent'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ShowConfirm } from 'common/components/Alert'
import { Styled } from 'styles/stylesComponent'
import { IColumnAntD } from 'common/constants/interface'
import { useCallback, useEffect, useState } from 'react'
import { supplierServices } from './SupplierApis'
import { getDataSource, openNotification, openNotificationError } from 'common/utils'
import { isNil } from 'lodash'
import { ISupplier } from './supplier.props'
import ModalComponent from 'common/components/modal/Modal'
import AddEditSupplier from './components/AddEditSupplier'
import { useAuth } from 'hooks/useAuth'

function SupplierPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [rowSelected, setRowSelected] = useState<ISupplier | undefined>()
  const { user } = useAuth()
  const [payload, setPayload] = useState<any>({
    page: 1,
    take: 10,
    q: ''
  })
  const [suppliers, setSuppliers] = useState<Array<ISupplier>>([])
  const [count, setCount] = useState<number>(0)

  const handleOpenAddModal = () => {
    setRowSelected(undefined)
    setModalVisible(true)
  }

  const handleOpenEditModal = (record: ISupplier) => {
    setRowSelected(record)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setRowSelected(undefined)
    setModalVisible(false)
  }

  const columnsListCategory: IColumnAntD[] = [
    {
      title: 'STT',
      key: 'STT',
      dataIndex: 'STT',
      width: 20
    },
    {
      title: 'Mã nhà cung cấp',
      key: 'supplier_code',
      dataIndex: 'supplier_code'
    },
    {
      title: 'Tên nhà cung cấp',
      key: 'supplier_name',
      dataIndex: 'supplier_name'
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      dataIndex: 'phone'
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email'
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      dataIndex: 'createdAt'
    },
    {
      width: 80,
      title: 'Thao tác',
      key: 'tt',
      dataIndex: 'tt',
      render: (value: number, record: ISupplier) => {
        return (
          <div style={{ display: 'flex' }}>
            {user?.role === 'admin' && (
              <TooltipCustom
                title={'Cập nhật'}
                children={
                  <Button
                    type={'text'}
                    className={'btn-success-text'}
                    icon={<EditOutlined />}
                    onClick={() => handleOpenEditModal(record)}
                  />
                }
              />
            )}
            {user?.role === 'admin' && (
              <ShowConfirm
                placement='bottomLeft'
                onConfirm={() => handleRemoveSupplier(record)}
                confirmText={'Xóa'}
                title={'Bạn có chắc chắn muốn xóa nhà cung cấp này?'}
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

  const getSupplierList = async (value?: any) => {
    setIsLoading(true)
    try {
      const res = await supplierServices.get(value)
      setSuppliers(getDataSource(res?.data, payload.page))
      setCount(res?.meta?.itemCount)
    } catch (error) {
      console.log('🚀 ~ getSupplierList ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSupplier = async (value: any) => {
    try {
      const res = await supplierServices.delete(value?.id)
      if (res) {
        openNotification('success', 'Thành công', 'Xóa nhà cung cấp thành công')
        getSupplierList(payload)
      }
    } catch (error) {
      openNotificationError(error)
    }
  }

  const handleSubmit = async (values: ISupplier) => {
    setIsLoading(true)
    try {
      let res
      if (rowSelected?.id) {
        res = await supplierServices.update(rowSelected.id, values)
      } else {
        res = await supplierServices.create(values)
      }

      if (res) {
        openNotification(
          'success',
          'Thành công',
          `${rowSelected?.id ? 'Cập nhật' : 'Thêm mới'} nhà cung cấp thành công`
        )
        handleCloseModal()
        getSupplierList(payload)
      }
    } catch (error) {
      openNotificationError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = useCallback(
    (value: any) => {
      if (!isNil(value?.search)) {
        setPayload({
          ...payload,
          q: value?.search,
          page: 1
        })
      }
    },
    [payload]
  )

  useEffect(() => {
    getSupplierList(payload)
  }, [payload])

  return (
    <>
      <FilterSupplier onChangeValue={handleFilter} />
      <Row className='mb-2 flex justify-end mt-2'>
        {user?.role === 'admin' && (
          <Button type='primary' onClick={handleOpenAddModal}>
            Thêm mới
          </Button>
        )}
      </Row>
      <Spin spinning={isLoading}>
        <Styled.TableStyle
          bordered
          columns={columnsListCategory}
          dataSource={suppliers}
          pagination={{
            onChange: (page) => {
              setPayload({ ...payload, page: page })
            },
            total: count,
            current: payload.page,
            pageSize: payload.take
          }}
        />
      </Spin>
      {modalVisible && (
        <ModalComponent
          loading={isLoading}
          title={rowSelected?.id ? 'Cập nhật nhà cung cấp' : 'Thêm mới nhà cung cấp'}
          modalVisible={modalVisible}
          width={800}
          children={<AddEditSupplier onFinish={handleSubmit} onClose={handleCloseModal} rowSelected={rowSelected} />}
        />
      )}
    </>
  )
}

export default SupplierPage
