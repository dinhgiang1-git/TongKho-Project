import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { adminRoutes, publicRoutes, userRoutes } from './RouterTypes'
import PublicRoute from './PublicRoute'
import PrivateRoute from './PrivateRoute'

function AppNavigator() {
  return (
    <Router>
      <Routes>
        {publicRoutes.map((val, index) => (
          <Route key={index} path={val.path} element={<PublicRoute component={val.component} layout={val.layout} />} />
        ))}
        {adminRoutes.map((val, index) => (
          <Route key={index} path={val.path} element={<PrivateRoute component={val.component} layout={val.layout} />} />
        ))}
        {userRoutes.map((val, index) => (
          <Route key={index} path={val.path} element={<PrivateRoute component={val.component} layout={val.layout} />} />
        ))}
      </Routes>
    </Router>
  )
}

export default AppNavigator
