import { Modal, Spin } from 'antd'
import React, { CSSProperties } from 'react'
import styled from 'styled-components'

interface IProps {
  title: any
  modalVisible: boolean
  children: React.ReactNode
  width?: number
  bodyStyle?: CSSProperties
  loading?: boolean
  checked?: boolean
}

const ModalComponent: React.FC<IProps> = ({
  title,
  modalVisible,
  loading = false,
  children,
  bodyStyle,
  width = 600,
  checked = false
}) => {
  return (
    <ModalStyled
      maskClosable={false}
      width={width}
      destroyOnClose
      closable={false}
      bodyStyle={bodyStyle}
      footer={null}
      title={title}
      open={modalVisible}
      centered={checked}
    >
      <Spin spinning={loading}>{children}</Spin>
    </ModalStyled>
  )
}

const ModalStyled = styled(Modal)`
  & .ant-modal-title {
    text-align: left;
    font-weight: 700;
    font-size: 18px;
  }
`

export default ModalComponent
