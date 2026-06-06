import { Modal } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import './orderHistory.css'
import { orderServices } from './orderApis'
import { formatDate, formatPrice, openNotification, openNotificationError, vldOrderStatus } from 'common/utils'
import { ORDER_TYPE } from 'common/constants/constants'
import { motion } from 'framer-motion'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Home,
  ChevronRight,
  ShoppingBag,
  Download,
  Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const calculateOrderDetailLineTotal = (orderDetail: any) => {
  const price = Number(orderDetail.price || orderDetail.product?.price) || 0
  const quantity = Number(orderDetail.product_number) || 0

  return Math.round(price * quantity)
}

const normalizeOrderStatus = (status: any) => String(status)

function OrderHistory() {
  const navigate = useNavigate()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [payload] = useState<any>({})
  const [orders, setOrders] = useState<Array<any>>([])
  const [orderId, setOrderId] = useState<any>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const handleGetOrders = useCallback(async (payload: any) => {
    try {
      const res = await orderServices.getOrders(payload)
      if (res) {
        setOrders(res.data)
      }
    } catch (error) {
      console.log('🚀 ~ handleGetOrders ~ error:', error)
    }
  }, [])

  const handleCancelOrder = async (orderId: number) => {
    try {
      const res = await orderServices.cancelOrder(orderId)
      if (res) {
        openNotification('success', 'Thành công', 'Hủy đơn hàng thành công!')
        handleGetOrders(payload)
        setDeleteModalVisible(false)
      }
    } catch (error) {
      openNotificationError(error)
    }
  }

  const handleDownloadInvoice = async (order: any) => {
    try {
      const invoiceBlob = await orderServices.downloadInvoice(order.id, order.phone)
      const url = window.URL.createObjectURL(new Blob([invoiceBlob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `hoa-don-${order.id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      openNotificationError(error)
    }
  }

  useEffect(() => {
    handleGetOrders(payload)

    const refetchVisibleOrders = () => {
      if (document.visibilityState === 'visible') {
        handleGetOrders(payload)
      }
    }

    window.addEventListener('focus', refetchVisibleOrders)
    document.addEventListener('visibilitychange', refetchVisibleOrders)

    return () => {
      window.removeEventListener('focus', refetchVisibleOrders)
      document.removeEventListener('visibilitychange', refetchVisibleOrders)
    }
  }, [handleGetOrders, payload])

  const getStatusIcon = (status: string) => {
    switch (normalizeOrderStatus(status)) {
      case ORDER_TYPE.PENDING:
        return <Clock className='w-5 h-5' />
      case ORDER_TYPE.PROCESSING:
        return <Package className='w-5 h-5' />
      case ORDER_TYPE.WAITING_FOR_PAYMENT:
        return <Truck className='w-5 h-5' />
      case ORDER_TYPE.PAID:
        return <CheckCircle className='w-5 h-5' />
      case ORDER_TYPE.CANCELED:
        return <XCircle className='w-5 h-5' />
      default:
        return <Clock className='w-5 h-5' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (normalizeOrderStatus(status)) {
      case ORDER_TYPE.PENDING:
        return 'text-yellow-600 bg-yellow-50'
      case ORDER_TYPE.PROCESSING:
        return 'text-blue-600 bg-blue-50'
      case ORDER_TYPE.WAITING_FOR_PAYMENT:
        return 'text-indigo-600 bg-indigo-50'
      case ORDER_TYPE.PAID:
        return 'text-green-600 bg-green-50'
      case ORDER_TYPE.CANCELED:
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Breadcrumb */}
      <div className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center text-sm'>
          <div
            className='flex items-center text-gray-500 hover:text-primary cursor-pointer transition-colors'
            onClick={() => navigate('/')}
          >
            <Home className='w-4 h-4 mr-1' />
            <span>Trang chủ</span>
          </div>
          <ChevronRight className='w-4 h-4 mx-2 text-gray-400' />
          <span className='font-medium text-gray-900'>Lịch sử đơn hàng</span>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-2 h-8 bg-primary rounded-full'></div>
          <h2 className='text-2xl font-bold sm:text-3xl font-black text-gray-900 uppercase tracking-tight'>
            Lịch sử đơn hàng
          </h2>
        </div>

        <div className='space-y-6 lg:space-y-8'>
          {orders && orders.length > 0 ? (
            orders.map((item, index) => (
              <motion.div
                key={`${index}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'
              >
                {/* Header */}
                <div className='p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
                    <div className='flex items-center space-x-4'>
                      <div
                        className={`p-3 rounded-2xl shadow-sm bg-white border border-gray-100 ${getStatusColor(item.order_status).split(' ')[0]}`}
                      >
                        {getStatusIcon(item.order_status)}
                      </div>
                      <div>
                        <h3 className='text-lg font-black text-gray-900'>Đơn hàng #{item.id}</h3>
                        <p className='text-sm text-gray-500 font-medium'>{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(item.order_status)} shadow-sm`}
                    >
                      {vldOrderStatus(item.order_status)}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className='p-5 sm:p-6'>
                  <div className='space-y-6'>
                    {item.order_details.map((od: any, index: number) => (
                      <div
                        key={`${index}-${od.id}`}
                        className='flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 rounded-2xl hover:bg-gray-50 transition-colors'
                      >
                        <div
                          className='flex items-center space-x-4 cursor-pointer'
                          onClick={() => navigate(`/product-detail/${od.product_id}`)}
                        >
                          <div className='w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-2'>
                            <img
                              src={od.product?.image}
                              alt={od.product?.name}
                              className='w-full h-full object-contain mix-blend-multiply'
                            />
                          </div>
                          <div className='flex-1'>
                            <h4 className='text-base font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors'>
                              {od.product?.name}
                            </h4>
                            <div className='flex items-center gap-3 mt-2'>
                              <span className='text-sm font-medium text-gray-500'>
                                SL: <span className='font-bold text-gray-700'>{od.product_number}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-right sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-4 sm:mt-0'>
                          <p className='text-sm font-medium text-gray-500 sm:mb-1'>
                            {formatPrice(od.price || od.product?.price)} ₫
                          </p>
                          <p className='text-lg font-bold text-primary'>
                            {formatPrice(calculateOrderDetailLineTotal(od))} ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className='px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
                    <div className='text-sm text-gray-500 font-medium'>
                      Tổng thanh toán:
                      <span className='ml-3 text-2xl font-black text-primary'>
                        {formatPrice(item.total_price)}{' '}
                        <span className='text-lg underline decoration-2 underline-offset-4'>đ</span>
                      </span>
                    </div>
                    <div className='flex flex-col sm:flex-row gap-3'>
                      <button
                        onClick={() => {
                          setSelectedOrder(item)
                          setDetailModalVisible(true)
                        }}
                        className='w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-700 hover:text-primary bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2'
                      >
                        <Eye className='w-4 h-4' />
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(item)}
                        className='w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-700 hover:text-primary bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2'
                      >
                        <Download className='w-4 h-4' />
                        Xuất hóa đơn
                      </button>
                      {normalizeOrderStatus(item.order_status) === ORDER_TYPE.PENDING && (
                        <button
                          onClick={() => {
                            setDeleteModalVisible(true)
                            setOrderId(item.id)
                          }}
                          className='w-full sm:w-auto px-6 py-3 text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md'
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm'>
              <ShoppingBag className='w-16 h-16 text-gray-300 mb-4' />
              <p className='text-xl font-bold text-gray-900 mb-2'>Chưa có đơn hàng nào</p>
              <p className='text-gray-500 mb-6'>Bạn chưa thực hiện giao dịch nào trên hệ thống</p>
              <button
                onClick={() => navigate('/product')}
                className='px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-hover hover:-translate-y-1 transition-all duration-300 shadow-md'
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-red-50 flex items-center justify-center'>
              <XCircle className='w-6 h-6 text-red-500' />
            </div>
            <span className='text-xl font-black text-gray-900'>Xác nhận hủy đơn hàng</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <button
            key='cancel'
            onClick={() => {
              setDeleteModalVisible(false)
              setOrderId(null)
            }}
            className='w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 mr-0 sm:mr-3 mb-3 sm:mb-0'
          >
            Đóng
          </button>,
          <button
            key='confirm'
            onClick={() => {
              handleCancelOrder(orderId)
              setOrderId(null)
            }}
            className='w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md'
          >
            Xác nhận hủy
          </button>
        ]}
        centered
        className='sm:max-w-md [&_.ant-modal-content]:!rounded-3xl [&_.ant-modal-content]:!p-6'
        closeIcon={false}
      >
        <p className='text-base text-gray-600 font-medium mt-2'>
          Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
              <Eye className='w-6 h-6 text-blue-500' />
            </div>
            <span className='text-xl font-black text-gray-900'>Chi tiết đơn hàng #{selectedOrder?.id}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <button
            key='close'
            onClick={() => setDetailModalVisible(false)}
            className='px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200'
          >
            Đóng
          </button>
        ]}
        centered
        className='sm:max-w-2xl [&_.ant-modal-content]:!rounded-3xl [&_.ant-modal-content]:!p-6'
        closeIcon={false}
      >
        {selectedOrder && (
          <div className='mt-6 space-y-6'>
            <div className='bg-gray-50 rounded-2xl p-5 border border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2'>
                Thông tin giao hàng
              </h3>
              <div className='space-y-3 text-base'>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Người nhận:</span>
                  <span className='font-bold text-gray-900'>{selectedOrder.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Số điện thoại:</span>
                  <span className='font-bold text-gray-900'>{selectedOrder.phone}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Địa chỉ:</span>
                  <span className='font-bold text-gray-900 text-right max-w-xs'>
                    {[selectedOrder.address, selectedOrder.ward, selectedOrder.district, selectedOrder.city]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
                {selectedOrder.note && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500 font-medium'>Ghi chú:</span>
                    <span className='font-bold text-gray-900 text-right max-w-xs'>{selectedOrder.note}</span>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-gray-50 rounded-2xl p-5 border border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2'>
                Thông tin thanh toán
              </h3>
              <div className='space-y-3 text-base'>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Tổng tiền hàng:</span>
                  <span className='font-bold text-gray-900'>{formatPrice(selectedOrder.total_price)} ₫</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Phương thức thanh toán:</span>
                  <span className='font-bold text-gray-900'>
                    {selectedOrder.payment_method === 'VNPAY' ? 'VNPay' : 'Thanh toán khi nhận hàng (COD)'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Trạng thái thanh toán:</span>
                  <span className={`font-bold ${selectedOrder.pay_type === 'pay' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedOrder.pay_type === 'pay' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                {selectedOrder.vnp_transaction_no && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500 font-medium'>Mã giao dịch VNPay:</span>
                    <span className='font-bold text-gray-900'>{selectedOrder.vnp_transaction_no}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-500 font-medium'>Trạng thái đơn hàng:</span>
                  <span className={`font-bold ${getStatusColor(selectedOrder.order_status).split(' ')[0]}`}>
                    {vldOrderStatus(selectedOrder.order_status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderHistory
