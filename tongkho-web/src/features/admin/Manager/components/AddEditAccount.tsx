import { Button, Col, Form, Input, Row } from 'antd'
import UploadSingleFile from 'common/components/upload/UploadComponent'
import Config from 'common/constants/config'
import { TEXT_CONSTANTS } from 'common/constants/constants'
import { IAccount } from '../Manager.props'
import RadiusSelection from 'common/components/select/RadiusSelection'

interface IAddEditAccount {
  onFinish?: (value: any) => void
  onClose?: () => void
  rowSelected?: IAccount
}

export const AddEditManager = ({ onFinish, onClose, rowSelected }: IAddEditAccount) => {
  const [form] = Form.useForm()

  const initialvalue = {
    name: rowSelected?.name,
    username: rowSelected?.username,
    phone: rowSelected?.phone,
    email: rowSelected?.email,
    password: rowSelected?.password,
    avatar: rowSelected?.avatar,
    status: rowSelected?.s,
    role: rowSelected?.role
  }

  return (
    <Form
      form={form}
      initialValues={initialvalue}
      name='addEditAccount'
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
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='username'
            label='Tên đăng nhập'
            rules={[
              {
                required: true,
                message: `Tên đăng nhập: ${TEXT_CONSTANTS.IS_NOT_EMPTY}`
              },
              {
                min: 3,
                max: 50,
                message: `Tên đăng nhập: Từ 3-50 ký tự`
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: `Tên đăng nhập: Chỉ chứa chữ, số và dấu gạch dưới`
              }
            ]}
          >
            <Input readOnly={!!rowSelected} />
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
            <Input readOnly={!!rowSelected} />
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
            <Input readOnly={!!rowSelected} />
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
                onChange={(value: string) => {
                  initialvalue.status = value
                }}
                defaultValue={'active'}
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
                console.log('🚀 ~ AddEditManager ~ imageUrl:', imageUrl)
                form.setFieldsValue({ avatar: imageUrl })
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label='Vai trò'
            name='role'
            rules={[
              {
                required: true,
                message: 'Vai trò: Bắt buộc chọn'
              }
            ]}
          >
            <RadiusSelection
              options={[
                { value: 'admin', text: 'Quản trị viên' },
                { value: 'staff', text: 'Nhân viên' }
              ]}
              placeholder='Chọn vai trò'
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
          <Button htmlType='submit' className='btn-confirm' style={{ marginLeft: '10px' }}>
            Xác nhận
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
