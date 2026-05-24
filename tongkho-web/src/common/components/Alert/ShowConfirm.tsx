/* eslint-disable react-hooks/rules-of-hooks */
import { CloseCircleOutlined, LeftCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Popconfirm } from 'antd'
import { showComfirmProps } from './ShowConfirm.props'

export const ShowConfirm = ({ title, children, onConfirm, cancelText, confirmText, ...props }: showComfirmProps) => {
  return (
    <div>
      <Popconfirm
        {...props}
        title={title ? title : 'Thông báo'}
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        okText={
          <span>
            <CloseCircleOutlined />
            &nbsp; {`${confirmText ? confirmText : 'Xóa'}`}
          </span>
        }
        cancelText={
          <span>
            <LeftCircleOutlined />
            &nbsp; {`${cancelText ? cancelText : 'Trở lại'}`}
          </span>
        }
        okButtonProps={{
          danger: true,
          type: 'default',
          style: { borderRadius: '3px', fontWeight: 'bold' }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '3px',
            borderColor: '#1890ff',
            color: '#1890ff',
            fontWeight: 'bold'
          }
        }}
        onConfirm={onConfirm && onConfirm}
        children={children ? children : <></>}
      />
    </div>
  )
}
