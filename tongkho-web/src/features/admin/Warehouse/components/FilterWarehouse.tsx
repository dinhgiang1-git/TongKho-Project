import { Col } from 'antd'
import RJSearch from 'common/components/search/RJSearch'
import RadiusSelection from 'common/components/select/RadiusSelection'
import RangerPicker from 'common/components/rangePicker/RangePicker'

interface IFilter {
  onChangeValue?: (value: any) => void
}

interface IStatusOption {
  value: number
  text: string
}

const STATUS_OPTIONS: IStatusOption[] = [
  { value: 1, text: 'Đang hoạt động' },
  { value: 2, text: 'Ngừng hoạt động' }
]

function FilterWarehouse({ onChangeValue }: IFilter) {
  const onSearch = (value: string) => {
    onChangeValue?.({ search: value, page: 1 })
  }

  const handleStatusChange = (value: number | undefined) => {
    const tmpValue = value === undefined ? null : value
    onChangeValue?.({ status: tmpValue })
  }

  const handleDateChange = (name: string, value: any) => {
    onChangeValue?.({ date: value || '' })
  }

  return (
    <>
      <Col md={7}>
        <RJSearch placeholder='Nhập tên kho' onInputSearch={onSearch} />
      </Col>
      <Col md={7}>
        <RadiusSelection placeholder='Trạng thái hoạt động' onChange={handleStatusChange} options={STATUS_OPTIONS} />
      </Col>
      <Col md={10}>
        <RangerPicker onChange={handleDateChange} name='createDate' />
      </Col>
    </>
  )
}

export default FilterWarehouse
