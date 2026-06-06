/* eslint-disable @typescript-eslint/no-unused-vars */
import { DeleteOutlined, EditOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Row, Spin, Tag, Tooltip } from 'antd'
import { ShowConfirm } from 'common/components/Alert'
import { TooltipCustom } from 'common/components/tooltip/ToolTipComponent'
import { IColumnAntD } from 'common/constants/interface'
import { Styled } from 'styles/stylesComponent'
import FilterOrder from './components/FilterOrder'
import { useCallback, useEffect, useState } from 'react'
import { orderServices } from './OrderApis'
import { formatPrice, getDataSource, vldOrderStatus } from 'common/utils'
import { isNil, values } from 'lodash'
import { useNavigate } from 'react-router'
import { ADMIN_PATH } from 'common/constants/paths'
import styled from 'styled-components'
import IconAntd from 'common/components/iconAntd'
import { openNotification, openNotificationError } from 'common/utils'
import { OrderStatus } from './constants/order.constant'

function AdminOrderPage() {
  const [loadingRefresh, setLoadingRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [orders, setOrders] = useState<Array<any>>([])
  const [orderCount, setOrderCount] = useState<number>(0)
  const navigate = useNavigate()
  const [payload, setPayload] = useState<any>({
    page: 1,
    take: 10,
    q: '',
    status: null,
    to_date: '',
    from_date: ''
  })
  console.log('🚀 ~ AdminOrderPage ~ payload:', payload)
  const columnsListAccount: IColumnAntD[] = [
    {
      title: 'STT',
      key: 'STT',
      dataIndex: 'STT',
      width: 20
    },
    {
      title: 'Mã đơn',
      key: 'id',
      dataIndex: 'id',
      width: 90,
      render: (value: number) => <Tag color='default'>#{value}</Tag>
    },
    {
      title: 'Họ và tên',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: 'Số loại sản phẩm',
      key: 'order_details',
      dataIndex: 'order_details',
      render: (value: any) => {
        return <div>{value.length}</div>
      }
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      dataIndex: 'phone'
    },
    {
      title: 'Trạng thái ĐH',
      key: 'order_status',
      dataIndex: 'order_status',
      render: (value: string) => {
        return <Tag color='processing'>{vldOrderStatus(value)}</Tag>
      }
    },
    {
      title: 'Thanh toán',
      key: 'pay_type',
      dataIndex: 'pay_type',
      render: (value: string) => {
        return <Tag color={value === 'pay' ? 'success' : 'warning'}>{value === 'pay' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
      }
    },
    {
      title: 'Ngày đặt hàng',
      key: 'createdAt',
      dataIndex: 'createdAt'
    },
    {
      title: 'Tổng tiền',
      key: 'total_price',
      dataIndex: 'total_price',
      render: (value: string) => {
        return <Tag color='gold'>{formatPrice(value)}</Tag>
      }
    },
    {
      width: 80,
      title: 'Thao tác',
      key: 'tt',
      dataIndex: 'tt',
      render: (value: number, record: any) => {
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <TooltipCustom
              title={'Xem chi tiết'}
              children={
                <Button
                  type={'text'}
                  className={'btn-success-text'}
                  icon={<EyeOutlined />}
                  onClick={() => handleEditOrder(record)}
                />
              }
            />
            {![OrderStatus.PAID, OrderStatus.CANCELED].includes(record.order_status) && (
              <ShowConfirm
                placement='bottomLeft'
                onConfirm={() => handleCancelOrder(record)}
                confirmText={'Xác nhận hủy'}
                title={'Bạn có chắc chắn muốn hủy đơn hàng này?'}
              >
                <TooltipCustom
                  title='Hủy đơn hàng'
                  children={<Button type='text' danger icon={<CloseOutlined />} />}
                />
              </ShowConfirm>
            )}
          </div>
        )
      }
    }
  ]

  const handleGetOrders = async (value?: any) => {
    try {
      const res = await orderServices.get(value)
      setOrders(getDataSource(res?.data, 1))
      setOrderCount(res?.meta?.item_count)
    } catch (error) {
      console.log('🚀 ~ handleGetOrders ~ error:', error)
    }
  }

  const handleExportOrders = async (value?: any) => {
    try {
      const res = await orderServices.export(value)
      if (res) {
        const path = res?.data
        window.open(path)
      }
    } catch (error) {
      console.log('🚀 ~ handleExportOrders ~ error:', error)
    }
  }

  const handleEditOrder = useCallback(
    (record: any) => {
      navigate(`${ADMIN_PATH.UPDATE_ORDER}/${record?.id}`)
    },
    [navigate]
  )

  const handleCancelOrder = async (record: any) => {
    try {
      setIsLoading(true)
      const res = await orderServices.cancelOrder(record.id)
      if (res) {
        openNotification('success', 'Thành công', 'Đã hủy đơn hàng!')
        handleGetOrders(payload)
      }
    } catch (error) {
      openNotificationError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterProduct = useCallback(
    (value: any) => {
      if (!isNil(value?.search)) {
        setPayload({
          ...payload,
          q: value?.search
        })
      }
      if (!isNil(value?.status)) {
        setPayload({
          ...payload,
          status: value?.status
        })
      }
      if (value?.date) {
        setPayload({
          ...payload,
          from_date: value?.date.split(',')[0],
          to_date: value?.date.split(',')[1]
        })
      }
    },
    [payload]
  )

  useEffect(() => {
    handleGetOrders(payload)
  }, [payload])
  return (
    <>
      <FilterOrder onChangeValue={handleFilterProduct} />
      <Row className='mb-2 mt-2 flex justify-end'></Row>
      <Row className='flex items-center' justify='start' align='middle'>
        <ResultStyled className='mb-2'>
          <div className='font-semibold'>Kết quả lọc: </div>
          <Tag className='ml-2' color='magenta'>
            {orderCount}
          </Tag>
          <div>
            <Tooltip title='Tải lại dữ liệu'>
              <ReloadStyled
                onClick={() => {
                  handleGetOrders(values)
                }}
              >
                <IconAntd
                  spin={false}
                  style={{ color: loadingRefresh ? 'red' : 'black' }}
                  size='16px'
                  icon='ReloadOutlined'
                />
              </ReloadStyled>
            </Tooltip>
          </div>
        </ResultStyled>
      </Row>
      <Spin spinning={isLoading}>
        <Styled.TableStyle
          bordered
          columns={columnsListAccount}
          dataSource={orders}
          pagination={{
            pageSize: payload.take,
            onChange: (page) => {
              setIsLoading(true)
              setTimeout(() => {
                setPayload({ ...payload, page: page })
                setIsLoading(false)
              }, 200)
            },
            total: orderCount,
            current: payload.page
          }}
        />
      </Spin>
    </>
  )
}

export default AdminOrderPage

const ResultStyled = styled.div`
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
`
const ReloadStyled = styled.div`
  margin-left: 10px;
  cursor: pointer;

  &:hover {
    scale: 1.3;
  }
`
