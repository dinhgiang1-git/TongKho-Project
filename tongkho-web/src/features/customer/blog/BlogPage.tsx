import React, { useEffect, useState } from 'react'
import { blogServices } from './blogApis'
import { useNavigate } from 'react-router'
import { USER_PATH } from 'common/constants/paths'

export default function Blog() {
  const [blogs, setBlogs] = useState<Array<any>>([])
  const navigation = useNavigate()

  const getBlogs = async () => {
    try {
      const res = await blogServices.get()
      if (res) {
        setBlogs(res?.data)
      }
    } catch (error) {
      console.log('🚀 ~ getBlogs ~ error:', error)
    }
  }

  useEffect(() => {
    getBlogs()
  }, [])

  const getFirstTextContent = (htmlString: string) => {
    const parser = new DOMParser()
    const doc = parser?.parseFromString(htmlString, 'text/html')
    const nodes = doc.body.childNodes

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE && node.textContent?.trim()) {
        return node.textContent?.trim()
      }
    }

    return ''
  }

  return (
    <div className='min-h-screen bg-gray-100 p-6 w-full'>
      <div className='max-w-5xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-4'>Bài viết của TS Shop</h1>
        <p className='text-gray-600 mb-6'>
          Cập nhật tin tức và bài viết mới nhất về những mẫu quần áo thời trang mới và những bài viết hữu ích về thời
          trang.
        </p>
        <div className='space-y-6'>
          {blogs &&
            blogs.length &&
            blogs.map((post) => (
              <div key={post.id} className='bg-white p-4 rounded-lg shadow-md flex items-start space-x-4'>
                <img src={post?.user.avatar} alt={post} className='w-10 h-10 rounded-full' />
                <div className='flex-1'>
                  <div className='flex justify-between items-start'>
                    <div className=' w-[70%]'>
                      <h2
                        className='text-lg font-semibold text-gray-800 hover:underline hover:cursor-pointer'
                        onClick={() => {
                          navigation(`${USER_PATH.BLOG}/${post?.id}`)
                        }}
                      >
                        {post?.title}
                      </h2>
                      <p className='text-gray-600 mt-1'>{getFirstTextContent(post?.content).slice(0, 200) + '...'}</p>
                      <div className='text-sm text-gray-500 mt-2 flex items-center space-x-2'>
                        <span className='px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs'>{post.category}</span>
                        <span>{post.date}</span>
                        <span>&#8226;</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <img
                      src={post.blog_photo}
                      alt='Thumbnail'
                      className='w-[200px] h-[140px] rounded-lg object-cover'
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
