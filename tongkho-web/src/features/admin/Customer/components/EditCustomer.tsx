import { Button, Col, Form, Input, Row } from 'antd'
import UploadSingleFile from 'common/components/upload/UploadComponent'
import Config from 'common/constants/config'
import { TEXT_CONSTANTS } from 'common/constants/constants'
import RadiusSelection from 'common/components/select/RadiusSelection'
import { IAccount } from '../Customer.props'
import { useCallback } from 'react'
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

  const getInitialStatus = () => {
    if (rowSelected?.textStatus === 'Đang hoạt động' || rowSelected?.textStatus === 'Hoạt động') {
      return 'active'
    }
    return 'inactive'
  }

  const initialvalue = {
    id: rowSelected?.id,
    name: rowSelected?.name,
    phone: rowSelected?.phone,
    email: rowSelected?.email,
    password: rowSelected?.password,
    avatar: rowSelected?.avatar,
    status: getInitialStatus()
  }

  const onFinishForm = async (values: any) => {
    try {
      const res = await customerServices.updateCustomer(String(rowSelected?.id), {
        name: values.name,
        phone: values.phone,
        email: values.email,
        status: values.status,
        avatar: values.avatar
      })
      if (res) {
        openNotification('success', 'Thành công', 'Cập nhật thành công!')
        onClose?.()
      }
    } catch (error) {
      console.log('🚀 ~ onFinishForm ~ error:', error)
    }
  }

  return (
    <Form
      form={form}
      initialValues={initialvalue}
      name='addEditCustomer'
      labelAlign='left'
      onFinish={onFinishForm}
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
            <Input />
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
            <Input />
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
            <Input />
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
              label='Trạng thái hoạt động'
              name='status'
              rules={[
                {
                  required: true,
                  message: 'Trạng thái hoạt động: Bắt buộc chọn'
                }
              ]}
            >
              <RadiusSelection
                options={[
                  { value: 'active', text: 'Đang hoạt động' },
                  { value: 'inactive', text: 'Ngừng hoạt động' }
                ]}
                placeholder='Chọn trạng thái hoạt động'
                allowClear={false}
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
        <Col span={12} className='flex items-center justify-end gap-2.5'>
          <Button danger onClick={onClose}>
            Thoát
          </Button>
          <Button
            htmlType='submit'
            type='primary'
            className='btn-confirm'
          >
            Xác nhận
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
