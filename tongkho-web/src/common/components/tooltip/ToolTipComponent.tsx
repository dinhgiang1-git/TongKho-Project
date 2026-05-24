import { Tooltip } from 'antd'
import { TooltipType } from './Tooltip.props'

export const TooltipCustom = ({ title, content, children, ...props }: TooltipType) => {
  return (
    <Tooltip {...props} title={title}>
      {children}
      {content}
    </Tooltip>
  )
}
