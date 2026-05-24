import { USER_PATH } from 'common/constants/paths'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ShoppingBag, ClipboardList } from 'lucide-react'

// Simple confetti particle
const Particle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    className='absolute top-0 rounded-full pointer-events-none'
    style={{ left: `${x}%`, width: 8, height: 8, background: color }}
    initial={{ y: -20, opacity: 1, scale: 1, rotate: 0 }}
    animate={{ y: '110vh', opacity: 0, scale: 0.4, rotate: 360 * 3 }}
    transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
  />
)

const COLORS = ['#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#f97316']

function OrderSuccess() {
  const navigate = useNavigate()
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number }[]>([])

  useEffect(() => {
    const list = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.2
    }))
    setParticles(list)
  }, [])

  return (
    <div
      className='relative w-full min-h-screen flex items-center justify-center overflow-hidden'
      style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f5f0ff 100%)' }}
    >
      {/* Confetti */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} color={p.color} delay={p.delay} />
      ))}

      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl'
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl'
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative z-10 bg-white rounded-3xl shadow-2xl p-10 sm:p-14 flex flex-col items-center text-center mx-4'
        style={{ maxWidth: 460, boxShadow: '0 20px 60px rgba(59,130,246,0.15)' }}
      >
        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className='relative mb-6'
        >
          {/* Outer glow ring */}
          <motion.div
            className='absolute inset-0 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2), transparent)' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Circle background */}
          <div
            className='w-28 h-28 rounded-full flex items-center justify-center'
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            {/* Checkmark SVG */}
            <motion.svg
              viewBox='0 0 52 52'
              className='w-14 h-14'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            >
              <motion.path
                fill='none'
                stroke='white'
                strokeWidth={4}
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14 27 L22 35 L38 19'
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2'>Đặt hàng thành công! 🎉</h1>
          <p className='text-gray-500 text-sm sm:text-base leading-relaxed mb-8'>
            Cảm ơn bạn đã tin tưởng mua hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className='flex flex-col sm:flex-row gap-3 w-full'
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(USER_PATH.ORDER_HISTORY)}
            className='flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-lg'
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <ClipboardList className='w-4 h-4' />
            Xem đơn hàng
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(USER_PATH.PRODUCT)}
            className='flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200'
          >
            <ShoppingBag className='w-4 h-4' />
            Tiếp tục mua hàng
          </motion.button>
        </motion.div>

        {/* Subtle progress bar decoration */}
        <motion.div className='w-full h-1 rounded-full mt-8 overflow-hidden' style={{ background: '#f0fdf4' }}>
          <motion.div
            className='h-full rounded-full'
            style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
          />
        </motion.div>
        <p className='text-xs text-gray-400 mt-2'>Đơn hàng đã được xác nhận</p>
      </motion.div>
    </div>
  )
}

export default OrderSuccess
