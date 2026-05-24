import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Image } from 'antd'
import { formatPrice } from 'common/utils'

const RelatedProducts = ({ productList, handleClick }: any) => {
  const settings = {
    dots: true, // Hiển thị dấu chấm bên dưới
    infinite: false, // Vòng lặp vô tận
    speed: 500, // Thời gian chuyển slide (ms)
    slidesToShow: 4, // Số sản phẩm hiển thị trên mỗi slide
    slidesToScroll: 4, // Số lượng sản phẩm cuộn mỗi lần
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3 // Hiển thị 3 sản phẩm trên màn hình tablet
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2 // Hiển thị 2 sản phẩm trên màn hình di động
        }
      }
    ]
    // nextArrow: <CustomNextArrow />, // Nút bấm bên phải
    // prevArrow: <CustomPrevArrow /> // Nút bấm bên trái
  }

  return (
    <div className='w-full px-4'>
      <h2 className='text-center text-custom-xl mb-4'>Sản Phẩm Liên Quan</h2>
      <Slider {...settings}>
        {productList.map((product: any) => (
          <div key={product.id} className='px-2'>
            <div className=''>
              <div className='group'>
                <div className='relative overflow-hidden block'>
                  <Image
                    height={400}
                    onClick={() => {
                      if (handleClick) handleClick(product.id)
                    }}
                    src={
                      product.image
                        ? product?.image
                        : 'https://bizweb.dktcdn.net/100/415/697/products/ak058.png?v=1701405312903'
                    }
                    alt='Product'
                    className='w-full object-cover block '
                  />
                  <div
                    onClick={() => {
                      if (handleClick) handleClick(product.id)
                    }}
                    className='absolute cursor-pointer inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform transition-all h-[400px]'
                  ></div>
                </div>
                <div
                  onClick={() => {
                    if (handleClick) handleClick(product.id)
                  }}
                  className='text-center cursor-pointer'
                >
                  <h3 className='text-custom-xs font-semibold  mt-2'>{product?.name}</h3>
                  <h2 className='text-custom-sm font-semibold mt-2 '>{formatPrice(product?.price)} VND</h2>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default RelatedProducts
