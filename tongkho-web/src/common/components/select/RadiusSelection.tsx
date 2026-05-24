import { Select } from 'antd'

interface OptionItem {
  value: string | number | null
  text: string | number
  disabled?: boolean
}

const { Option } = Select
export interface PropsRadiusSelection {
  placeholder: string
  defaultValue?: number | string
  options: Array<OptionItem>
  onChange?: (value: any) => void
  onFocus?: () => void
  onBlur?: () => void
  showSearch?: boolean
  onSearch?: (value: any) => void
  style?: any
  value?: number | string
  id?: string
  disabled?: boolean
  allowClear?: boolean
  mode?: 'multiple' | 'tags'
}

export default function RadiusSelection({
  placeholder,
  defaultValue,
  options,
  onChange,
  onFocus,
  onBlur,
  showSearch,
  onSearch,
  style,
  value,
  allowClear = true,
  id,
  mode,
  disabled
}: PropsRadiusSelection) {
  return (
    <Select
      id={id}
      mode={mode}
      className='radius-select'
      style={style ? style : { width: '100%', fontWeight: 'normal' }}
      allowClear={allowClear}
      placeholder={placeholder}
      defaultValue={defaultValue || undefined}
      optionFilterProp='children'
      showSearch={showSearch}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onSearch={onSearch}
      value={value}
      disabled={disabled}
    >
      {options?.map((item: OptionItem, idx: number) => {
        return (
          <Option key={idx} value={item.value} disabled={item.disabled}>
            {item?.text}
          </Option>
        )
      })}
    </Select>
  )
}
