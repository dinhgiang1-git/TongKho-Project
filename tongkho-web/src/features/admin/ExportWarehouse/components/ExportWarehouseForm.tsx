import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, message } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { productServices } from '../../Product/ProductApis'
import { warehouseServices } from '../../Warehouse/warehouseApis'
import { IExportProduct } from '../ExportWarehouse.props'

interface IExportWarehouseForm {
  onFinish?: (value: any) => void
  onClose?: () => void
}

interface IOption {
  label: string
  value: number
  quantity?: number
  name?: string
}

interface IUser {
  id: number
  name: string
}

export const ExportWarehouseForm = ({ onFinish, onClose }: IExportWarehouseForm) => {
  const [form] = Form.useForm()
  const [products, setProducts] = useState<IExportProduct[]>([])
  const [productOptions, setProductOptions] = useState<IOption[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<IOption[]>([])
  const currentUser = useSelector((state: { login: { user: IUser } }) => state.login.user)

  const handleGetProducts = useCallback(async () => {
    try {
      const res = await productServices.get({ page: 1, take: 1000 })
      const options = res.data.map((item: any) => ({
        label: `${item.name} - còn ${item.quantity || 0}`,
        value: item.id,
        quantity: Number(item.quantity || 0),
        name: item.name
      }))
      setProductOptions(options)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }, [])

  const handleGetWarehouses = useCallback(async () => {
    try {
      const res = await warehouseServices.get({
        page: 1,
        status: 1,
        take: 1000
      })
      const options = res.data.map((item: any) => ({
        label: item.warehouse_name,
        value: item.id
      }))
      setWarehouseOptions(options)

      if (options.length === 1) {
        form.setFieldsValue({ warehouse_id: options[0].value })
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  }, [form])

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
  }, [currentUser, form, handleGetProducts, handleGetWarehouses])

  const handleAddProduct = () => {
    setProducts([...products, { product_id: 0, product_name: '', quantity: 1, note: '', available_quantity: 0 }])
  }

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleProductChange = (value: number, index: number) => {
    const selectedProduct = productOptions.find((item) => item.value === value)
    setProducts(
      products.map((product, i) =>
        i === index
          ? {
              ...product,
              product_id: value,
              product_name: selectedProduct?.name || '',
              quantity: 1,
              available_quantity: selectedProduct?.quantity || 0
            }
          : product
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
    if (!products.length) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm cần xuất')
      return
    }

    const invalidProduct = products.find((product) => {
      return !product.product_id || product.quantity < 1 || product.quantity > Number(product.available_quantity || 0)
    })

    if (invalidProduct) {
      message.warning('Vui lòng kiểm tra sản phẩm và số lượng xuất không vượt quá tồn kho')
      return
    }

    const payload = {
      ...values,
      staff_id: currentUser.id,
      export_date: values.export_date.format('YYYY-MM-DD HH:mm:ss'),
      products: products.map((product) => ({
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: product.quantity,
        note: product.note
      }))
    }
    onFinish?.(payload)
  }

  return (
    <Form
      form={form}
      name='exportWarehouse'
      labelAlign='left'
      onFinish={handleSubmit}
      scrollToFirstError
      layout='vertical'
      initialValues={{
        export_date: dayjs()
      }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='staff_name'
            label='Họ tên người xuất'
            rules={[{ required: true, message: 'Vui lòng nhập họ tên người xuất' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='warehouse_id'
            label='Kho xuất'
            rules={[{ required: true, message: 'Vui lòng chọn kho xuất' }]}
          >
            <Select options={warehouseOptions} placeholder='Chọn kho xuất' />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name='export_date'
            label='Thời gian xuất'
            rules={[{ required: true, message: 'Vui lòng chọn thời gian xuất' }]}
          >
            <DatePicker format='YYYY-MM-DD' style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <div className='mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold'>Danh sách sản phẩm xuất</h3>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddProduct}>
            Thêm sản phẩm
          </Button>
        </div>

        {products.map((product, index) => (
          <div key={index} className='mb-4 p-4 border rounded-lg'>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label='Sản phẩm' required>
                  <Select
                    showSearch
                    virtual={false}
                    listHeight={250}
                    options={productOptions}
                    onChange={(value) => handleProductChange(value, index)}
                    placeholder='Chọn sản phẩm'
                    optionFilterProp='label'
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label='Số lượng xuất' required>
                  <InputNumber
                    min={1}
                    max={product.available_quantity || 1}
                    value={product.quantity}
                    style={{ width: '100%' }}
                    onChange={(value) => handleQuantityChange(value, index)}
                  />
                  <div className='mt-1 text-xs text-slate-500'>Tồn: {product.available_quantity || 0}</div>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label='Ghi chú'>
                  <Input onChange={(e) => handleNoteChange(e.target.value, index)} placeholder='Lý do xuất hàng' />
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
            Xuất hàng
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
