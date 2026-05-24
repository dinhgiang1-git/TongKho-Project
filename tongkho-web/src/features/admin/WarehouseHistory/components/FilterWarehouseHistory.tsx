import { Col } from 'antd'
import RJSearch from 'common/components/search/RJSearch'
import RadiusSelection from 'common/components/select/RadiusSelection'
import RangerPicker from 'common/components/rangePicker/RangePicker'
import { useEffect, useState } from 'react'
import { warehouseServices } from '../../Warehouse/warehouseApis'

interface IFilter {
  onChangeValue?: (value: any) => void
}

interface IWarehouseOption {
  text: string
  value: number
}

function FilterWarehouseHistory({ onChangeValue }: IFilter) {
  const [payload, setPayload] = useState({
    q: '',
    limit: 5
  })
  const [warehouseListOptions, setWarehouseListOptions] = useState<IWarehouseOption[]>([])

  const onSearch = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      search: value,
      page: 1
    }))
  }

  const handleGetWarehouseListOptions = async (payload: any) => {
    try {
      const res = await warehouseServices.get(payload)
      const options = res.data.map((item: any) => ({
        text: item?.name,
        value: item?.id
      }))
      setWarehouseListOptions(options)
    } catch (error) {
      console.error('Failed to fetch warehouse options:', error)
    }
  }

  useEffect(() => {
    handleGetWarehouseListOptions(payload)
  }, [payload])

  const handleWarehouseChange = (value: number | undefined) => {
    const tmpValue = value === undefined ? null : value
    onChangeValue?.({ warehouse_id: tmpValue })
  }

  const handleDateChange = (name: string, value: any) => {
    onChangeValue?.({ date: value || '' })
  }

  return (
    <>
      <Col md={7}>
        <RJSearch
          placeholder='Nhập tên sản phẩm'
          onInputSearch={(value: string) => onChangeValue?.({ search: value })}
        />
      </Col>
      <Col md={7}>
        <RadiusSelection
          showSearch
          onSearch={onSearch}
          placeholder='Kho'
          onChange={handleWarehouseChange}
          options={warehouseListOptions}
        />
      </Col>
      <Col md={10}>
        <RangerPicker onChange={handleDateChange} name='createDate' />
      </Col>
    </>
  )
}

export default FilterWarehouseHistory
