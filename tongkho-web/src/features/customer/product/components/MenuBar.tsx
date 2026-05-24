import React, { useState } from 'react'

const Menu = () => {
  const [isStatusOpen, setIsStatusOpen] = useState(true)
  const [isStyleOpen, setIsStyleOpen] = useState(false)
  const [isProductLineOpen, setIsProductLineOpen] = useState(false)

  const toggleMenu = (menuName) => {
    switch (menuName) {
      case 'status':
        setIsStatusOpen(!isStatusOpen)
        break
      case 'style':
        setIsStyleOpen(!isStyleOpen)
        break
      case 'productLine':
        setIsProductLineOpen(!isProductLineOpen)
        break
      default:
        break
    }
  }

  return (
    <div style={{ width: '200px', fontFamily: 'Arial, sans-serif' }}>
      <div>
        <h3 onClick={() => toggleMenu('status')} style={{ cursor: 'pointer', color: 'orange' }}>
          TRẠNG THÁI {isStatusOpen ? '↑' : '↓'}
        </h3>
        {isStatusOpen && (
          <ul>
            <li>Limited Edition</li>
            <li>Sale off</li>
            <li>New Arrival</li>
          </ul>
        )}
      </div>
      <hr />
      <div>
        <h3 onClick={() => toggleMenu('style')} style={{ cursor: 'pointer', color: 'orange' }}>
          KIỂU DÁNG {isStyleOpen ? '↑' : '↓'}
        </h3>
        {isStyleOpen && (
          <ul>
            <li>Low Top</li>
            <li>High Top</li>
            <li>Slip-on</li>
            <li>Mid Top</li>
            <li>Mule</li>
          </ul>
        )}
      </div>
      <hr />
      <div>
        <h3 onClick={() => toggleMenu('productLine')} style={{ cursor: 'pointer', color: 'orange' }}>
          DÒNG SẢN PHẨM {isProductLineOpen ? '↑' : '↓'}
        </h3>
        {isProductLineOpen && (
          <ul>
            <li>Basas</li>
            <li>Vintas</li>
            <li>Urbas</li>
          </ul>
        )}
      </div>
    </div>
  )
}

export default Menu
