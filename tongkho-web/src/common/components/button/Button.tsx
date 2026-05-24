import React from 'react'

interface CustomButtonProps {
  label?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

const CustomButton: React.FC<CustomButtonProps> = ({ label = 'Button', onClick, disabled = false, ...props }) => {
  return (
    <button
      type='submit'
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 text-custom-xl font-semibold uppercase rounded-lg transform transition-all bg-money hover:bg-black text-while`}
      {...props}
    >
      {label}
    </button>
  )
}

export default React.memo(CustomButton)
