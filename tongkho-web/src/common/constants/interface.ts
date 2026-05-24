export interface IColumnAntD {
  title: string | null
  dataIndex: string
  key: string
  width?: number
  render?: (value: any, row?: any, index?: any) => any
  align?: 'left' | 'center' | 'right'
}
