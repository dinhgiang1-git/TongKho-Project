/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Col, Row } from 'antd'
import RJSearch from 'common/components/search/RJSearch'

interface IFilter {
  onChangeValue?: any
}

function FilterSupplier({ onChangeValue }: IFilter) {
  return (
    <>
      <Row gutter={24}>
        <Col md={8}>
          <RJSearch
            placeholder='Nhập tên hoặc mã nhà cung cấp'
            onInputSearch={(value: string) => {
              onChangeValue({ search: value })
            }}
          />
        </Col>
      </Row>
    </>
  )
}

export default FilterSupplier
