import { TooltipProps } from 'antd'

export type TooltipType = TooltipProps & {
  title?: string
  content?: string
  children?: any
  visible?: boolean
}

export declare type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom'
