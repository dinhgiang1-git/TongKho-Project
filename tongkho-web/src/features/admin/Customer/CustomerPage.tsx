/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Row, Spin } from 'antd'
import { Styled } from 'styles/stylesComponent'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { getDataSource, openNotification } from 'common/utils'
import ModalComponent from 'common/components/modal/Modal'
import { TooltipCustom } from 'common/components/tooltip/ToolTipComponent'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ShowConfirm } from 'common/components/Alert'
import { customerServices } from './CustomerApis'
import { IColumnAntD } from 'common/constants/interface'
import { IAccount, IPayLoadListUser } from '../Manager/Manager.props'
import FilterCustomer from './components/FilterCustomer'
import { EditCustomer } from './components/EditCustomer'

function CustomerPage() {
  const [page, setPage] = useState<number>(1)
  const [payload, setPayload] = useState({
    page: 1,
    take: 10,
    q: '',
    status: '',
    to_date: '',
    from_date: ''
  })
  const [accounts, setAccount] = useState<any>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [count, setCount] = useState<number>(0)
  const [textButton, setTextButton] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rowSelected, setRowSelected] = useState<IAccount>()

  const columnsListAccount: IColumnAntD[] = [
    {
      title: 'STT',
      key: 'STT',
      dataIndex: 'STT',
      width: 20
    },
    {
      title: 'Họ và tên',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email'
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      dataIndex: 'phone'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'textStatus'
    },
    {
      width: 80,
      title: 'Thao tác',
      key: 'tt',
      dataIndex: 'tt',
      render: (value: number, record: any) => {
        return (
          <div style={{ display: 'flex' }}>
            <TooltipCustom
              title={'Cập nhật'}
              children={
                <Button
                  type={'text'}
                  className={'btn-success-text'}
                  icon={<EditOutlined />}
                  onClick={() => handleEditAccount(record)}
                />
              }
            />
          </div>
        )
      }
    }
  ]

  const handleGetAccount = async (payload?: IPayLoadListUser) => {
    try {
      const res = await customerServices.get(payload)
      setAccount(getDataSource(res?.data, 1))
      setCount(res?.meta?.item_count)
    } catch (error) {
      console.log('🚀 ~ handleGetAccount ~ error:', error)
    }
  }

  useEffect(() => {
    handleGetAccount(payload)
  }, [payload])

  const handleFilter = useCallback(
    (value: any) => {
      if (value?.status) {
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

  const handleSetModalVisible = useCallback(() => {
    setModalVisible(false)
    setRowSelected(undefined)
    handleGetAccount()
  }, [])

  const handleEditAccount = useCallback(async (record: IAccount) => {
    setModalVisible(true)
    setRowSelected(record)
  }, [])

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-4'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>Quản lý khách hàng</h2>
          <p className='mt-1 text-xs text-slate-500'>
            Tìm kiếm, phân lọc và cập nhật thông tin trạng thái tài khoản khách hàng.
          </p>
        </div>
      </div>
      
      <div className='mb-4'>
        <FilterCustomer onChangeValue={handleFilter} />
      </div>

      <Spin spinning={isLoading} size='large'>
        <Styled.TableStyle
          bordered
          columns={columnsListAccount}
          dataSource={accounts}
          rowKey='id'
          className='custom-table shadow-sm border border-slate-100 rounded-lg overflow-hidden'
          pagination={{
            pageSize: payload.take,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
            onChange: (page) => {
              setIsLoading(true)
              setTimeout(() => {
                setPayload({ ...payload, page: page })
                setIsLoading(false)
              }, 200)
            },
            total: count,
            current: payload.page
          }}
          scroll={{ x: 800 }}
        />
      </Spin>
      <ModalComponent
        loading={isLoading}
        title='Cập nhật thông tin khách hàng'
        width={800}
        modalVisible={modalVisible}
        children={<EditCustomer onClose={handleSetModalVisible} rowSelected={rowSelected} />}
      />
    </div>
  )
}

export default CustomerPage
