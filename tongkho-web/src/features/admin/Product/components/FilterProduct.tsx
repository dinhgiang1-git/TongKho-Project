/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Col, Row } from 'antd'
import RJSearch from 'common/components/search/RJSearch'
import RadiusSelection from 'common/components/select/RadiusSelection'
import RangerPicker from 'common/components/rangePicker/RangePicker'
import { CommonStatus } from 'common/constants/constants'
import { SortBy } from '../constants/product.constants'
import { useEffect, useState } from 'react'
import { categoryServices } from 'features/admin/Category/CategoryApis'

interface IFilter {
  onChangeValue?: any
}
function FilterProduct({ onChangeValue }: IFilter) {
  const [payload, setPayload] = useState<any>({
    q: '',
    limit: 5
  })
  const [categoryListOptions, setCategoryListOptions] = useState<any>([])

  const onChangeSearchCategory = async (value: any) => {
    setPayload({
      q: value
    })
  }

  const handleGetCategoryListOptions = async (payload: any) => {
    try {
      const res = await categoryServices.get(payload)
      setCategoryListOptions(
        res.data.map((item: any) => {
          return {
            text: item?.name,
            value: item?.id
          }
        })
      )
    } catch (error) {
      console.log('🚀 ~ handleGetCategoryListOptions ~ error:', error)
    }
  }

  useEffect(() => {
    handleGetCategoryListOptions(payload)
  }, [payload])

  return (
    <>
      <Row gutter={24}>
        <Col md={8}>
          <RJSearch
            placeholder='Nhập tên, mã sản phẩm'
            onInputSearch={(value: string) => {
              onChangeValue({ search: value })
            }}
          />
        </Col>
        <Col md={8}>
          <RadiusSelection
            placeholder={'Trạng thái hoạt động'}
            onChange={(value: number) => {
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ status: tmpValue })
            }}
            options={[
              { value: CommonStatus.ACTIVE, text: 'Đang hoạt động' },
              { value: CommonStatus.INACTIVE, text: 'Ngừng hoạt động' }
            ]}
          />
        </Col>
        <Col md={8}>
          <RangerPicker
            onChange={(name: string, value: any) => onChangeValue({ date: value ? value : '' })}
            name='createDate'
          />
        </Col>
      </Row>
      <Row gutter={24} className='mt-4'>
        {/* <Col md={8}>
          <RadiusSelection
            placeholder={'Trạng thái hoạt động'}
            onChange={(value: number) => {
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ product_type: tmpValue })
            }}
            options={[
              { value: ProductTypes.BEST_SELLING, text: 'Hàng bán chạy' },
              { value: ProductTypes.INVENTORY, text: 'Hàng tồn kho' },
              { value: ProductTypes.NEW_PRODUCT, text: 'Hàng mới về' }
            ]}
          />
        </Col> */}
        <Col md={8}>
          <RadiusSelection
            allowClear
            placeholder={'Sắp xếp theo'}
            onChange={(value: number) => {
              console.log('🚀 ~ FilterProduct ~ value:', value)
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ sortBy: tmpValue })
            }}
            options={[
              { value: SortBy.ASC, text: 'Giá tăng dần' },
              { value: SortBy.DESC, text: 'Giá giảm dần' }
            ]}
          />
        </Col>
        <Col md={8}>
          <RadiusSelection
            showSearch={true}
            onSearch={(e) => onChangeSearchCategory(e)}
            placeholder={'Danh mục'}
            onChange={(value: number) => {
              let tmpValue
              value === undefined ? (tmpValue = null) : (tmpValue = value)
              onChangeValue({ categoryId: tmpValue })
            }}
            options={categoryListOptions}
          />
        </Col>
      </Row>
    </>
  )
}

export default FilterProduct
