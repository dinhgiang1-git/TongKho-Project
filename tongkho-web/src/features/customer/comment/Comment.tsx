import TextArea from 'antd/es/input/TextArea'
import { Avatar, Button, Empty } from 'antd'
import { UserOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { openNotificationError, timeSince } from 'common/utils'
import { productServices } from '../product/productApis'

interface IPropsComment {
  id: number
  reviews?: []
  getProduct?: any
}

function Comment({ id, reviews, getProduct }: IPropsComment) {
  const [comment, setComment] = useState<string>('')
  const [products, setProduct] = useState<any>([])
  const [productId, setProductId] = useState<number>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setProductId(id)
  }, [id])

  useEffect(() => {
    setProduct(reviews)
  }, [reviews])

  const handleSubmit = async () => {
    if (!comment.trim()) return
    try {
      setLoading(true)
      await productServices.comment({ comment, product_id: productId })
      setComment('')
      getProduct(id)
    } catch (error) {
      openNotificationError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className='w-full max-w-4xl mx-auto px-4 py-8'>
      {/* Section Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50'>
          <MessageOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-800 m-0'>Đánh giá sản phẩm</h3>
          <p className='text-sm text-gray-400 m-0'>
            {products?.length ? `${products.length} nhận xét` : 'Chưa có nhận xét'}
          </p>
        </div>
      </div>

      {/* Comment Input Box */}
      <div
        className='rounded-2xl border p-5 mb-8 transition-all'
        style={{
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%)',
          borderColor: '#dbeafe'
        }}
      >
        <div className='flex gap-3'>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', flexShrink: 0 }}
          />
          <div className='flex-1'>
            <TextArea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Chia sẻ cảm nhận của bạn về sản phẩm... (Ctrl+Enter để gửi)'
              maxLength={2000}
              showCount
              style={{
                borderRadius: 12,
                border: '1.5px solid #dbeafe',
                background: '#fff',
                resize: 'none',
                fontSize: 14,
                lineHeight: 1.6
              }}
            />
            <div className='flex justify-end mt-3'>
              <Button
                type='primary'
                icon={<SendOutlined />}
                loading={loading}
                disabled={!comment.trim()}
                onClick={handleSubmit}
                style={{
                  background: comment.trim() ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : undefined,
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  height: 38,
                  paddingInline: 20
                }}
              >
                Gửi đánh giá
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {products && products.length > 0 ? (
        <div
          className='space-y-4 overflow-y-auto pr-1'
          style={{ maxHeight: 480, scrollbarWidth: 'thin', scrollbarColor: '#bfdbfe #f1f5f9' }}
        >
          {products.map((p: any, index: number) => (
            <div
              key={index}
              className='group rounded-2xl border bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md'
              style={{ borderColor: '#f1f5f9' }}
            >
              <div className='flex items-start gap-3'>
                {/* Avatar */}
                <Avatar
                  size={40}
                  src={p.user?.avatar || undefined}
                  icon={<UserOutlined />}
                  style={{
                    background: p.user?.avatar
                      ? undefined
                      : `linear-gradient(135deg, hsl(${(index * 47) % 360}, 65%, 55%), hsl(${(index * 47 + 40) % 360}, 65%, 65%))`,
                    flexShrink: 0
                  }}
                />

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-semibold text-gray-800 text-sm'>{p.user?.name || 'Người dùng ẩn danh'}</span>
                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' className='w-3 h-3 fill-gray-400'>
                        <path d='M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z' />
                      </svg>
                      {timeSince(p.created_at)}
                    </span>
                  </div>

                  {/* Comment bubble */}
                  <div
                    className='text-gray-700 text-sm leading-relaxed rounded-xl px-4 py-3'
                    style={{ background: '#f8faff', borderLeft: '3px solid #bfdbfe' }}
                  >
                    {p.comment}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className='text-gray-400 text-sm'>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</span>
          }
          style={{ padding: '40px 0' }}
        />
      )}
    </div>
  )
}

export default Comment
