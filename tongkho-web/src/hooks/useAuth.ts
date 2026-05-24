import { authService } from 'features/admin/Auth/services/Apis'
import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  role: string
  phone: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getUserInfo()
        console.log('🚀 ~ fetchUser ~ res:', res)
        setUser(res.data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}
