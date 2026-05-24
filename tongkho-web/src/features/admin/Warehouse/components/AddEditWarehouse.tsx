import { Button, Col, Form, Input, Row } from 'antd'
import { TEXT_CONSTANTS } from 'common/constants/constants'
import RadiusSelection from 'common/components/select/RadiusSelection'
import { IWarehouse } from '../Warehouse.props'

interface IAddEditWarehouse {
  onFinish?: (value: any) => void
  onClose?: () => void
  rowSelected?: IWarehouse
}

export const AddEditWarehouse = ({ onFinish, onClose, rowSelected }: IAddEditWarehouse) => {
  const [form] = Form.useForm()

  const initialvalue = {
    warehouse_name: rowSelected?.warehouse_name,
    warehouse_code: rowSelected?.warehouse_code,
    status: rowSelected?.s
  }

  return (
    <Form
      form={form}
      initialValues={initialvalue}
      name='addAddEditWarehouse'
      labelAlign='left'
      onFinish={onFinish}
      scrollToFirstError
      layout='vertical'
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='warehouse_name'
            label='Tên kho'
            rules={[
              {
                required: true,
                message: `Tên kho: ${TEXT_CONSTANTS.IS_NOT_EMPTY} `
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='warehouse_code'
            label='Mã kho'
            rules={[
              {
                required: true,
                message: `Mã kho: ${TEXT_CONSTANTS.IS_NOT_EMPTY} `
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        {rowSelected && (
          <Col span={24}>
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
                onChange={() => {}}
                options={[
                  { value: 1, text: 'Hoạt động' },
                  { value: 2, text: 'Ngừng hoạt động' }
                ]}
                placeholder='Trạng thái'
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Row gutter={24}>
        <Col span={12}> </Col>
        <Col span={12} className='flex items-center justify-end'>
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
