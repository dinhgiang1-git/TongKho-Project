import { Steps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface IStep {
  step: number
}

const OrderStep = ({ step }: IStep) => (
  <Steps
    current={step}
    items={[
      {
        title: 'Chờ xác nhận',
        icon: step === 1 ? <LoadingOutlined /> : undefined
      },
      {
        title: 'Đang chuẩn bị hàng',
        icon: step === 2 ? <LoadingOutlined /> : step > 1 ? undefined : undefined
      },
      {
        title: 'Đang vận chuyển',
        icon: step === 3 ? <LoadingOutlined /> : step > 2 ? undefined : undefined
      },
      {
        title: 'Hoàn thành',
        icon: step === 4 ? undefined : undefined
      }
    ]}
  />
)

export default OrderStep
