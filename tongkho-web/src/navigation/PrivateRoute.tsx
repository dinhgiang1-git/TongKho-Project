import { Suspense } from 'react'
import { Navigate } from 'react-router'

interface PrivateRouteProps {
  component: any
  layout?: any
}

export default function PrivateRoute({ component, layout }: PrivateRouteProps) {
  const token = localStorage.getItem('token')
  const Component = component
  const Layout = layout
  return token ? (
    Layout ? (
      <Layout>
        <Suspense>
          <Component />
        </Suspense>
      </Layout>
    ) : (
      <Suspense>
        <Component />
      </Suspense>
    )
  ) : (
    <Navigate to='/ad-login' />
  )
}
