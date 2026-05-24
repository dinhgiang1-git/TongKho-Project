/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchOutlined } from '@ant-design/icons'
import { Input, InputProps } from 'antd'
import React, { useCallback, useState } from 'react'

interface ISearch extends InputProps {
  onInputSearch?: any
  enterButton?: boolean
  defaultValue?: string
}

const RJSearch = ({ onInputSearch, placeholder, defaultValue, enterButton, ...props }: ISearch) => {
  const [value, setValue] = useState<string>()

  const handleChangeText = useCallback(
    (value: string) => {
      setValue(value)
      onInputSearch(value)
    },
    [value]
  )

  const handleClear = useCallback(() => {
    setValue('')
    if (onInputSearch) onInputSearch('')
  }, [onInputSearch])

  return (
    <div>
      <Input
        {...props}
        allowClear
        style={{ borderRadius: 4 }}
        defaultValue={defaultValue}
        value={value}
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        onChange={(e) => {
          handleChangeText(e.target?.value)
        }}
        onClear={handleClear}
      />
    </div>
  )
}

export default RJSearch
