import { Button, Col, DatePicker, Form, Input, Row, Select, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { IImportProduct } from '../ImportWarehouse.props'
import { productServices } from '../../Product/ProductApis'
import { warehouseServices } from '../../Warehouse/warehouseApis'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'

interface IImportWarehouseForm {
  onFinish?: (value: any) => void
  onClose?: () => void
}

interface IOption {
  label: string
  value: number
}

interface IUser {
  id: number
  name: string
}

export const ImportWarehouseForm = ({ onFinish, onClose }: IImportWarehouseForm) => {
  const [form] = Form.useForm()
  const [products, setProducts] = useState<IImportProduct[]>([])
  const [productOptions, setProductOptions] = useState<IOption[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<IOption[]>([])
  const currentUser = useSelector((state: { login: { user: IUser } }) => state.login.user)

  const handleGetProducts = async () => {
    try {
      const res = await productServices.get({ page: 1, take: 1000 }) //get all
      const options = res.data.map((item: any) => ({
        label: item.name,
        value: item.id
      }))
      setProductOptions(options)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleGetWarehouses = async () => {
    try {
      const res = await warehouseServices.get({
        page: 1,
        status: 1,
        take: 1000 //get all
      })
      const options = res.data.map((item: any) => ({
        label: item.warehouse_name,
        value: item.id
      }))
      setWarehouseOptions(options)
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  }

  useEffect(() => {
    handleGetProducts()
    handleGetWarehouses()
    if (currentUser) {
      form.setFieldsValue({
        staff_name: currentUser.name,
        staff_id: currentUser.id
      })
    } else {
      form.resetFields(['staff_name', 'staff_id'])
    }
  }, [currentUser, form])

  const handleAddProduct = () => {
    setProducts([...products, { product_id: 0, product_name: '', quantity: 1, note: '' }])
  }

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleProductChange = (value: number, index: number) => {
    const selectedProduct = productOptions.find((item) => item.value === value)
    setProducts(
      products.map((product, i) =>
        i === index ? { ...product, product_id: value, product_name: selectedProduct?.label || '' } : product
      )
    )
  }

  const handleQuantityChange = (value: number | null, index: number) => {
    setProducts(products.map((product, i) => (i === index ? { ...product, quantity: value || 1 } : product)))
  }

  const handleNoteChange = (value: string, index: number) => {
    setProducts(products.map((product, i) => (i === index ? { ...product, note: value } : product)))
  }

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      staff_id: currentUser.id,
      import_date: values.import_date.format('YYYY-MM-DD HH:mm:ss'),
      products
    }
    onFinish?.(payload)
  }

  return (
    <Form
      form={form}
      name='importWarehouse'
      labelAlign='left'
      onFinish={handleSubmit}
      scrollToFirstError
      layout='vertical'
      initialValues={{
        import_date: dayjs()
      }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='staff_name'
            label='Họ tên người nhập'
            rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhập' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='warehouse_id'
            label='Kho nhập'
            rules={[{ required: true, message: 'Vui lòng chọn kho nhập' }]}
          >
            <Select options={warehouseOptions} placeholder='Chọn kho nhập' />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='import_date'
            label='Thời gian nhập'
            rules={[{ required: true, message: 'Vui lòng chọn thời gian nhập' }]}
          >
            <DatePicker showTime format='YYYY-MM-DD HH:mm:ss' style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <div className='mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold'>Danh sách sản phẩm</h3>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddProduct}>
            Thêm sản phẩm
          </Button>
        </div>

        {products.map((product, index) => (
          <div key={index} className='mb-4 p-4 border rounded-lg'>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label='Sản phẩm' rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}>
                  <Select
                    options={productOptions}
                    onChange={(value) => handleProductChange(value, index)}
                    placeholder='Chọn sản phẩm'
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label='Số lượng' rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    onChange={(value) => handleQuantityChange(value, index)}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label='Ghi chú'>
                  <Input onChange={(e) => handleNoteChange(e.target.value, index)} placeholder='Nhập ghi chú' />
                </Form.Item>
              </Col>
              <Col span={2} className='flex items-end'>
                <Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(index)} />
              </Col>
            </Row>
          </div>
        ))}
      </div>

      <Row gutter={24}>
        <Col span={12} />
        <Col span={12} className='flex items-center justify-end'>
          <Button danger onClick={onClose}>
            Thoát
          </Button>
          <Button htmlType='submit' className='btn-confirm' style={{ marginLeft: '10px' }}>
            Nhập kho
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
