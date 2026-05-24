import { DatePicker, Tooltip } from 'antd'
import React from 'react'
const { RangePicker } = DatePicker
const dateFormat = 'DD/MM/YYYY'

const RangerPicker = ({
  name,
  onChange,
  tooltipTitle = 'Lọc theo ngày tạo',
  placeholderStart = 'Từ ngày',
  placeholderEnd = 'Đến ngày',
  defaultValue
}: {
  name: string
  onChange: any
  tooltipTitle?: string
  placeholderStart?: string
  placeholderEnd?: string
  defaultValue?: any
}) => {
  return (
    <Tooltip title={tooltipTitle}>
      <RangePicker
        className='w-full'
        onChange={(date: any, dateStrings: string[]) => {
          return onChange(
            name,
            date
              ? `${dateStrings[0].split('/').reverse().join('-')},${dateStrings[1].split('/').reverse().join('-')}`
              : ''
          )
        }}
        placeholder={[placeholderStart, placeholderEnd]}
        defaultValue={defaultValue}
        format={dateFormat}
      />
    </Tooltip>
  )
}

export default React.memo(RangerPicker)
