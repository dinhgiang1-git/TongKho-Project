/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Col } from 'antd'
import RJSearch from 'common/components/search/RJSearch'
import RadiusSelection from 'common/components/select/RadiusSelection'
import RangerPicker from 'common/components/rangePicker/RangePicker'

interface IFilter {
  onChangeValue?: any
}

function FilterAccount({ onChangeValue }: IFilter) {
  return (
    <>
      <Col md={7}>
        <RJSearch
          placeholder='Nhập tên hoặc số điện thoại'
          onInputSearch={(value: string) => {
            onChangeValue({ search: value })
          }}
        />
      </Col>
      <Col md={7}>
        <RadiusSelection
          placeholder={'Trạng thái hoạt động'}
          onChange={(value: string) => {
            let tmpValue
            value === undefined ? (tmpValue = null) : (tmpValue = value)
            onChangeValue({ status: tmpValue })
          }}
          options={[
            { value: 'active', text: 'Đang hoạt động' },
            { value: 'inactive', text: 'Ngừng hoạt động' }
          ]}
        />
      </Col>
      <Col md={10}>
        <RangerPicker
          onChange={(name: string, value: any) => onChangeValue({ date: value ? value : '' })}
          name='createDate'
        />
      </Col>
    </>
  )
}

export default FilterAccount
