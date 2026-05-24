import { Button, Form, Input } from 'antd'
import ModalComponent from 'common/components/modal/Modal'
import UploadSingleFile from 'common/components/upload/UploadComponent'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { accountServices } from '../accountApis'
import { openNotification, openNotificationError } from 'common/utils'
import { setLogin } from 'redux/slice/login.slice'

interface IAccount {
  openModal?: boolean
  isLoading?: boolean
  titleModal?: any
  onClose?: () => void
}

function AccountUser({ openModal, isLoading, titleModal, onClose }: IAccount) {
  const [user, setUser] = useState<any>({})
  const [imageUrl, setImageUrl] = useState<string>('')
  const data = useSelector((state: any) => state.login)
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  useEffect(() => {
    setUser(data.user)
    form.setFieldsValue({
      name: data.user?.name,
      email: data.user?.email,
      phone: data.user?.phone
    })
  }, [data, form])

  const onSuccessUpload = (url: string) => {
    try {
      setImageUrl(url)
    } catch (error) {
      console.log('🚀 ~ onSuccessUpload ~ error:', error)
    }
  }

  // Xử lý khi submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      console.log('🚀 ~ handleSubmit ~ values:', values)

      // Kiểm tra nếu nhập mật khẩu cũ thì mật khẩu mới và xác nhận mật khẩu phải có giá trị
      if (values.oldPassword) {
        if (!values.newPassword) {
          return form.setFields([{ name: 'newPassword', errors: ['Vui lòng nhập mật khẩu mới!'] }])
        }
        if (!values.confirmPassword) {
          return form.setFields([{ name: 'confirmPassword', errors: ['Vui lòng nhập lại mật khẩu mới!'] }])
        }
        if (values.newPassword === values.oldPassword) {
          return form.setFields([{ name: 'newPassword', errors: ['Mật khẩu mới phải khác mật khẩu cũ!'] }])
        }
        if (values.newPassword !== values.confirmPassword) {
          return form.setFields([{ name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp!'] }])
        }
      }

      const res = await accountServices.put(data.user.id, {
        ...values,
        avatar: imageUrl ? imageUrl : data.user.avatar,
        password: values.oldPassword,
        newPassword: values.newPassword
      })
      if (res) {
        openNotification('success', 'Thành công', 'Cập nhật thông tin thành công')
        dispatch(
          setLogin({
            ...data.user,
            ...values,
            avatar: imageUrl ? imageUrl : data.user.avatar
          })
        )
      }
    } catch (error) {
      openNotificationError(error)
    }
  }

  return (
    <ModalComponent
      loading={isLoading}
      title={<p className='text-custom-xl font-light'>{titleModal}</p>}
      width={800}
      modalVisible={openModal ?? false}
    >
      <div className='mt-4'>
        <div className='w-full h-auto flex items-center justify-center'>
          <div className='w-[30%]'>
            <UploadSingleFile initialImage={user?.avatar} onSuccessUpload={onSuccessUpload} />
          </div>
          <div className='w-[70%]'>
            <Form layout='vertical' form={form}>
              <Form.Item
                name='name'
                label='Họ và tên'
                rules={[{ required: true, message: 'Vui lòng nhập đủ họ và tên!' }]}
              >
                <Input className='outline-money' placeholder='Họ và tên' />
              </Form.Item>
              <Form.Item
                label='Số điện thoại'
                name='phone'
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder='Số điện thoại' disabled />
              </Form.Item>
              <Form.Item
                label='Email'
                name='email'
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder='Email' disabled />
              </Form.Item>

              {/* Mật khẩu cũ */}
              <Form.Item name='oldPassword' label='Mật khẩu cũ'>
                <Input.Password placeholder='Nhập mật khẩu cũ' />
              </Form.Item>

              {/* Mật khẩu mới (Không validate mặc định) */}
              <Form.Item name='newPassword' label='Mật khẩu mới'>
                <Input.Password placeholder='Nhập mật khẩu mới' />
              </Form.Item>

              {/* Xác nhận mật khẩu mới (Không validate mặc định) */}
              <Form.Item name='confirmPassword' label='Xác nhận mật khẩu'>
                <Input.Password placeholder='Nhập lại mật khẩu mới' />
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className='flex justify-end mt-4'>
          <Button danger onClick={onClose}>
            Thoát
          </Button>
          <Button className='bg-money border-money ml-4' onClick={handleSubmit}>
            Lưu
          </Button>
        </div>
      </div>
    </ModalComponent>
  )
}

export default AccountUser
