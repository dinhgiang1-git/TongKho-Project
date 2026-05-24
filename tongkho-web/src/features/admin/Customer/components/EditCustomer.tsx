import { Button, Col, Form, Input, Row } from 'antd'
import UploadSingleFile from 'common/components/upload/UploadComponent'
import Config from 'common/constants/config'
import { TEXT_CONSTANTS } from 'common/constants/constants'

import RadiusSelection from 'common/components/select/RadiusSelection'
import { IAccount } from '../Customer.props'
import { useCallback, useState } from 'react'
import { customerServices } from '../CustomerApis'
import { openNotification } from 'common/utils'

interface IAddEditAccount {
  onFinish?: (value: any) => void
  onClose?: () => void
  rowSelected?: IAccount
}

export const EditCustomer = ({ onFinish, onClose, rowSelected }: IAddEditAccount) => {
  console.log('🚀 ~ EditCustomer ~ rowSelected:', rowSelected)
  const [form] = Form.useForm()
  const [status, setStatus] = useState<string>('')
  console.log('🚀 ~ EditCustomer ~ status:', status)

  const handleUpdateCustomer = useCallback(async (id: string, data: any) => {
    try {
      const res = await customerServices.updateCustomer(id, data)
      if (res) {
        openNotification('success', 'Thành công', 'Cập nhật thành công!')
        onClose?.()
      }
    } catch (error) {
      console.log('🚀 ~ handleUpdateCustomer ~ error:', error)
    }
  }, [])

  const initialvalue = {
    id: rowSelected?.id,
    name: rowSelected?.name,
    phone: rowSelected?.phone,
    email: rowSelected?.email,
    password: rowSelected?.password,
    avatar: rowSelected?.avatar,
    status: rowSelected?.textStatus
  }
  console.log('🚀 ~ EditCustomer ~ initialvalue:', initialvalue)

  return (
    <Form
      form={form}
      initialValues={initialvalue}
      name='addEditCustomer'
      labelAlign='left'
      onFinish={onFinish}
      scrollToFirstError
      layout='vertical'
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='name'
            label='Họ và tên'
            rules={[
              {
                required: true,
                message: `Họ và tên: ${TEXT_CONSTANTS.IS_NOT_EMPTY} `
              }
            ]}
          >
            <Input readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='phone'
            label='Số điện thoại'
            rules={[
              {
                required: true,
                message: `Số điện thoại: ${TEXT_CONSTANTS.IS_NOT_EMPTY}`
              },
              {
                min: 10,
                max: 10,
                pattern: Config._reg.phone,
                message: `Số điện thoại: Không đúng định dạng`
              }
            ]}
          >
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='email'
            label='Email'
            rules={[
              {
                required: true,
                message: `Email: ${TEXT_CONSTANTS.IS_NOT_EMPTY} `
              },
              {
                type: 'email',
                message: `Email: Không đúng định dạng`
              }
            ]}
          >
            <Input readOnly />
          </Form.Item>
        </Col>
        {!rowSelected && (
          <Col span={12}>
            <Form.Item
              name='password'
              label='Password'
              rules={[
                {
                  required: true,
                  message: `Password: ${TEXT_CONSTANTS.IS_NOT_EMPTY} `
                },
                {
                  pattern: Config._reg.pass,
                  message: `Password: Không đúng định dạng`
                }
              ]}
            >
              <Input type='password' />
            </Form.Item>
          </Col>
        )}
        {rowSelected && (
          <Col span={12}>
            <Form.Item
              label=' Trạng thái'
              name='status'
              rules={[
                {
                  required: true,
                  message: 'Trạng thái hoạt động: Bắt buộc chọn'
                }
              ]}
            >
              <RadiusSelection
                onChange={(value) => {
                  setStatus(value)
                }}
                options={[
                  { value: 'active', text: 'Hoạt động' },
                  { value: 'inactive', text: 'Ngừng hoạt động' }
                ]}
                placeholder='Trạng thái'
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name='avatar' label='Ảnh đại diện'>
            <UploadSingleFile
              initialImage={initialvalue.avatar}
              onSuccessUpload={(imageUrl) => {
                form.setFieldsValue({ avatar: imageUrl })
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}> </Col>
        <Col span={12} className='flex items-center justify-end'>
          <Button danger onClick={onClose}>
            Thoát
          </Button>
          <Button
            onClick={() => {
              handleUpdateCustomer(String(initialvalue.id), { status })
            }}
            htmlType='submit'
            className='btn-confirm'
            style={{ marginLeft: '10px' }}
          >
            Xác nhận
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
