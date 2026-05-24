/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Col, Row } from 'antd'
import RJSearch from 'common/components/search/RJSearch'
import RadiusSelection from 'common/components/select/RadiusSelection'
import RangerPicker from 'common/components/rangePicker/RangePicker'
import { OrderStatus } from '../constants/order.constant'

interface IFilter {
  onChangeValue?: any
}
function FilterOrder({ onChangeValue }: IFilter) {
  return (
    <>
      <Row gutter={24}>
        <Col md={6}>
          <RJSearch
            placeholder='Nhập tên, số điện thoại, email'
            onInputSearch={(value: string) => {
              onChangeValue({ search: value })
            }}
          />
        </Col>
        <Col md={6}>
          <RadiusSelection
            placeholder={'Trạng thái đơn hàng'}
            onChange={(value: number) => {
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ status: tmpValue })
            }}
            options={[
              { value: OrderStatus.PENDING, text: 'Chờ xác nhận' },
              { value: OrderStatus.PROCESSING, text: 'Đang chuẩn bị hàng' },
              { value: OrderStatus.WAITING_FOR_PAYMENT, text: 'Đang giao hàng' },
              { value: OrderStatus.PAID, text: 'Hoàn thành' },
              { value: OrderStatus.CANCELED, text: 'Đã hủy' }
            ]}
          />
        </Col>
        {/* <Col md={6}>
          <RadiusSelection
            placeholder={'Trạng thái thanh toán'}
            onChange={(value: number) => {
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ status: tmpValue })
            }}
            options={[
              { value: CommonStatus.ACTIVE, text: 'Chưa thanh toán' },
              { value: CommonStatus.INACTIVE, text: 'Đã thanh toán' }
            ]}
          />
        </Col> */}
        <Col md={6}>
          <RangerPicker
            onChange={(name: string, value: any) => onChangeValue({ date: value ? value : '' })}
            name='createDate'
          />
        </Col>
      </Row>
    </>
  )
}

export default FilterOrder
