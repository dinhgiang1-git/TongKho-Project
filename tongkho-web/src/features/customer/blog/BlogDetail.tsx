import { useEffect, useState } from 'react'
import { blogServices } from './blogApis'
import { useParams } from 'react-router'
import { timeSince } from 'common/utils'

function BlogDetail() {
  const [blog, setBlog] = useState<any>({})
  const { id } = useParams()
  const safeId = id ?? ''

  const getBlog = async (id: string) => {
    try {
      const res = await blogServices.getById(id)
      if (res) {
        setBlog(res?.data)
      }
    } catch (error) {
      console.log('🚀 ~ getBlog ~ error:', error)
    }
  }

  useEffect(() => {
    getBlog(safeId)
  }, [safeId])

  return (
    <>
      <div className='min-h-screen bg-gray-100 p-6 w-full'>
        <div className='max-w-5xl mx-auto'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>{blog?.title}</h1>
          <div className='space-y-6'></div>
          <div className='flex items-center justify-start mt-10'>
            <div>
              <img src={blog?.user?.avatar} className='w-16 h-16 rounded-full' />
            </div>
            <div className='ml-4'>
              <span className='text-custom-sm font-semibold'>{blog?.user?.name}</span>
              <p>{timeSince(blog.created_at)}</p>
            </div>
          </div>
          <div className='mt-10 w-full text-custom-sm' dangerouslySetInnerHTML={{ __html: blog?.content }}></div>
        </div>
      </div>
    </>
  )
}

export default BlogDetail
