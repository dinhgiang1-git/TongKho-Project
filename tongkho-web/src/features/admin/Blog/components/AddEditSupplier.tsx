import { Button, Col, Form, Input, Row } from 'antd'
import { TEXT_CONSTANTS } from 'common/constants/constants'
import { useEffect } from 'react'
import { ISupplier } from '../supplier.props'

interface AddEditSupplierProps {
  onFinish: (values: ISupplier) => void
  onClose: () => void
  rowSelected?: ISupplier
}

function AddEditSupplier({ onFinish, onClose, rowSelected }: AddEditSupplierProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (rowSelected) {
      form.setFieldsValue(rowSelected)
    } else {
      form.resetFields()
    }
  }, [rowSelected, form])

  const initialValues = {
    supplier_code: rowSelected?.supplier_code,
    supplier_name: rowSelected?.supplier_name,
    phone: rowSelected?.phone,
    email: rowSelected?.email
  }

  return (
    <Form
      form={form}
      name='addEditSupplier'
      labelAlign='left'
      scrollToFirstError
      layout='vertical'
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='supplier_code'
            label='Mã nhà cung cấp'
            rules={[
              {
                required: true,
                message: `Mã nhà cung cấp: ${TEXT_CONSTANTS.IS_NOT_EMPTY}`
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='supplier_name'
            label='Tên nhà cung cấp'
            rules={[
              {
                required: true,
                message: `Tên nhà cung cấp: ${TEXT_CONSTANTS.IS_NOT_EMPTY}`
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
            name='phone'
            label='Số điện thoại'
            rules={[
              {
                pattern: /^(\d{10})$/,
                message: 'Số điện thoại phải có 10 chữ số'
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='email'
            label='Email'
            rules={[
              {
                type: 'email',
                message: 'Email không đúng định dạng'
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24} className='mt-10'>
        <Col span={24} className='flex items-center justify-end'>
          <Button danger onClick={onClose}>
            Thoát
          </Button>
          <Button htmlType='submit' className='btn-confirm' style={{ marginLeft: '10px' }}>
            Xác nhận
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default AddEditSupplier
