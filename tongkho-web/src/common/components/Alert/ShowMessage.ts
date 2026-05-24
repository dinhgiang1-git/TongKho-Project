import { notification } from 'antd'

interface IShowMessage {
  message?: string
  onClick?: () => void
  type?: 'error' | 'success' | 'warning' | 'info'
}
export const ShowMessage = ({ message, onClick, type = 'success' }: IShowMessage) => {
  switch (type) {
    case 'success':
      notification.success({
        message: message,
        placement: 'topRight',
        duration: 3.5,
        onClick: () => onClick && onClick()
      })
      break
    case 'info':
      notification.info({
        message: message,
        placement: 'topRight',
        duration: 3.5,
        onClick: () => onClick && onClick()
      })
      break
    case 'error':
      notification.error({
        message: message,
        placement: 'topRight',
        duration: 3.5,
        onClick: () => onClick && onClick()
      })
      break
    case 'warning':
      notification.warning({
        message: message,
        placement: 'topRight',
        duration: 3.5,
        onClick: () => onClick && onClick()
      })
      break
    default:
      break
  }
}
