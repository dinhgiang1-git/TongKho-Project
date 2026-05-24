import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'

interface DelayedSpinProps {
  delay?: number
}

const DelayedSpin: React.FC<DelayedSpinProps> = ({ delay = 1000 }) => {
  const [showSpinner, setShowSpinner] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <>
      {showSpinner && (
        <div className='fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-white bg-opacity-70 z-50'>
          <Spin size='large' />
        </div>
      )}
    </>
  )
}

export default DelayedSpin
