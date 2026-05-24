/* eslint-disable @typescript-eslint/no-unused-vars */
import { IColumnAntD } from 'common/constants/interface'
import OrderStep from './OrderSteps'
import { Styled } from 'styles/stylesComponent'
import { Button, Col, Image, Row, Card, Typography, Tag, Spin, Divider, Space } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { orderServices } from '../OrderApis'
import { formatPrice, getDataSource, openNotificationError } from 'common/utils'
import { OrderStatus } from '../constants/order.constant'
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, ShoppingCartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

function OrderDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>({})
  const [products, setProducts] = useState<Array<any>>([])

  const { total_price, address, name, phone, order_status } = order

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning'
      case OrderStatus.PROCESSING:
        return 'processing'
      case OrderStatus.WAITING_FOR_PAYMENT:
        return 'info'
      case OrderStatus.PAID:
        return 'success'
      default:
        return 'default'
    }
  }

  const columnsListAccount: IColumnAntD[] = [
    {
      title: 'STT',
      key: 'STT',
      dataIndex: 'STT',
      width: 60,
      align: 'center'
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      dataIndex: 'product',
      render: (value: any) => {
        return (
          <div className='flex items-center gap-4'>
            <Image width={80} height={80} src={value?.image} className='rounded-lg object-cover' />
            <div>
              <Text strong>{value?.name}</Text>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Số lượng',
      key: 'product_number',
      dataIndex: 'product_number',
      width: 100,
      align: 'center',
      render: (value: any) => {
        return <Tag color='blue'>{value}</Tag>
      }
    },
    {
      title: 'Đơn giá',
      key: 'price',
      dataIndex: 'price',
      width: 150,
      align: 'right',
      render: (value: any) => {
        return <Text strong>{formatPrice(value)}</Text>
      }
    }
  ]

  const getButtonText = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Xác nhận đơn hàng'
      case OrderStatus.PROCESSING:
        return 'Vận chuyển'
      case OrderStatus.WAITING_FOR_PAYMENT:
        return 'Hoàn thành'
      default:
        return 'Đang xử lý'
    }
  }

  const handleNextStep = async () => {
    try {
      setLoading(true)
      await orderServices.nextStep(id)
      handleGetOrder()
    } catch (error) {
      openNotificationError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetOrder = async () => {
    try {
      setLoading(true)
      const res = await orderServices.getById(id)
      if (res) {
        setOrder(res?.data)
        setProducts(getDataSource(res?.data?.order_details, 1))
      }
    } catch (error) {
      console.log('🚀 ~ handleGetOrder ~ error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGetOrder()
  }, [])

  return (
    <Spin spinning={loading}>
      <div className='space-y-6'>
        <Card>
          <OrderStep step={Number(order_status)} />
        </Card>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <Text strong>Chi tiết sản phẩm</Text>
                </Space>
              }
            >
              <Styled.TableStyle
                bordered
                columns={columnsListAccount}
                dataSource={products}
                pagination={false}
                className='order-detail-table'
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <Text strong>Thông tin khách hàng</Text>
                </Space>
              }
            >
              <Space direction='vertical' size='large' className='w-full'>
                <div className='flex items-center gap-2'>
                  <UserOutlined className='text-gray-500' />
                  <Text>Tên khách hàng:</Text>
                  <Text strong>{name}</Text>
                </div>

                <div className='flex items-center gap-2'>
                  <PhoneOutlined className='text-gray-500' />
                  <Text>Số điện thoại:</Text>
                  <Text strong>{phone}</Text>
                </div>

                <div className='flex items-center gap-2'>
                  <EnvironmentOutlined className='text-gray-500' />
                  <Text>Địa chỉ:</Text>
                  <Text strong>{address}</Text>
                </div>

                <Divider />

                <div className='flex justify-between items-center'>
                  <Text strong>Tổng thanh toán:</Text>
                  <Text strong className='text-xl text-primary'>
                    {formatPrice(total_price)}
                  </Text>
                </div>

                <div className='flex justify-between items-center'>
                  <Text strong>Trạng thái:</Text>
                  <Tag color={getStatusColor(order_status)}>{getButtonText(order_status)}</Tag>
                </div>

                {order_status !== OrderStatus.PAID && (
                  <div className='flex justify-end mt-4'>
                    <Button type='primary' size='large' onClick={handleNextStep} loading={loading}>
                      {getButtonText(order_status)}
                    </Button>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

export default OrderDetail
