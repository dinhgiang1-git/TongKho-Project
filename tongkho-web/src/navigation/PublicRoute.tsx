import { Suspense } from 'react'

interface PublicRouteProps {
  component: any
  layout: any
}

export default function PublicRoute({ component, layout }: PublicRouteProps) {
  const Component = component
  const Layout = layout
  return (
    <>
      {layout ? (
        <Layout>
          <Suspense>
            <Component />
          </Suspense>
        </Layout>
      ) : (
        <Suspense>
          <Component />
        </Suspense>
      )}
    </>
  )
}
