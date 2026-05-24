/* eslint-disable react-refresh/only-export-components */
import { ADMIN_PATH, USER_PATH } from 'common/constants/paths.ts'
import React, { lazy } from 'react'

//Layout
const AdminLayout = lazy(() => import('../common/layout/AdminLayout/adminLayout.tsx'))

//Admin
const AdminLogin = lazy(() => import('../features/admin/Auth/auth.tsx'))
const AdminDashBoard = lazy(() => import('../features/admin/AdminDashboard/adminDashboard.tsx'))
const ManagerPage = lazy(() => import('../features/admin/Manager/ManagerPage.tsx'))
const CustomerPage = lazy(() => import('../features/admin/Customer/CustomerPage.tsx'))
const CategoryPage = lazy(() => import('../features/admin/Category/CategoryPage.tsx'))
const AdminProductPage = lazy(() => import('../features/admin/Product/ProductPage.tsx'))
const AdminProductForm = lazy(() => import('../features/admin/Product/components/AddEditProduct.tsx'))
const SupplierForm = lazy(() => import('../features/admin/Blog/SupplierPage.tsx'))
const AdminOrderPage = lazy(() => import('../features/admin/Order/OrderPage.tsx'))
const AdminEditOrder = lazy(() => import('../features/admin/Order/components/OrderDetail.tsx'))
const WarehousePage = lazy(() => import('../features/admin/Warehouse/WarehousePage.tsx'))
const ImportWarehousePage = lazy(() => import('../features/admin/ImportWarehouse/ImportWarehousePage.tsx'))
//User
const HomePage = lazy(() => import('../features/customer/home/Home.tsx'))
const UserLayout = lazy(() => import('../common/layout/UserLayout/userLayout.tsx'))
const CustomerLoginPage = lazy(() => import('../features/customer/auth/Login.tsx'))
const RegisterPage = lazy(() => import('../features/customer/register/Register.tsx'))
const ProductPage = lazy(() => import('../features/customer/product/Product.tsx'))
const ProductDetail = lazy(() => import('../features/customer/detailProduct/DetailProduct.tsx'))
const CartPage = lazy(() => import('../features/customer/cart/Cart.tsx'))
const OrderPage = lazy(() => import('../features/customer/order/Order.tsx'))
const UploadFile = lazy(() => import('../common/components/upload/UploadComponent.tsx'))
const UploadMultipartFile = lazy(() => import('../common/components/upload/UploadMultipartComponent.tsx'))
const OrderSuccess = lazy(() => import('../features/customer/successOrder/SuccessOrder.tsx'))
const OrderHistory = lazy(() => import('../features/customer/order/OrderHistory.tsx'))
const BlogPage = lazy(() => import('../features/customer/blog/BlogPage.tsx'))
const BlogDetail = lazy(() => import('../features/customer/blog/BlogDetail.tsx'))

interface RouterProps {
  path: string
  component: React.FC | any
  params?: any
  layout?: any
}

export const adminRoutes: Array<RouterProps> = [
  {
    path: ADMIN_PATH.OVERVIEW,
    component: AdminDashBoard,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.MANAGER,
    component: ManagerPage,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.UPLOAD,
    component: UploadFile,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.UPLOADS,
    component: UploadMultipartFile,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.CUSTOMER,
    component: CustomerPage,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.CATEGORY,
    component: CategoryPage,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.PRODUCT,
    component: AdminProductPage,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.CREATE_UPDATE_PRODUCT,
    component: AdminProductForm,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.SUPPLIER,
    component: SupplierForm,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.ORDER,
    component: AdminOrderPage,
    layout: AdminLayout
  },
  {
    path: `${ADMIN_PATH.UPDATE_ORDER}/:id`,
    component: AdminEditOrder,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.WAREHOUSE,
    component: WarehousePage,
    layout: AdminLayout
  },
  {
    path: ADMIN_PATH.IMPORT_WAREHOUSE,
    component: ImportWarehousePage,
    layout: AdminLayout
  }
]

export const userRoutes: Array<RouterProps> = [
  {
    path: USER_PATH.CART,
    component: AdminLogin,
    layout: UserLayout
  },
  {
    path: USER_PATH.ORDER_SUCCESS,
    component: OrderSuccess
  }
]

export const publicRoutes: Array<RouterProps> = [
  {
    path: '',
    component: HomePage,
    layout: UserLayout
  },
  {
    path: ADMIN_PATH.LOGIN,
    component: AdminLogin
  },
  {
    path: USER_PATH.LOGIN,
    component: CustomerLoginPage
  },
  {
    path: USER_PATH.REGISTER,
    component: RegisterPage
  },
  {
    path: USER_PATH.PRODUCT,
    component: ProductPage,
    layout: UserLayout
  },
  {
    path: USER_PATH.PRODUCT_DETAIL + '/:id',
    component: ProductDetail,
    layout: UserLayout
  },
  {
    path: USER_PATH.CART,
    component: CartPage,
    layout: UserLayout
  },
  {
    path: USER_PATH.ORDER,
    component: OrderPage,
    layout: UserLayout
  },
  {
    path: USER_PATH.ORDER_HISTORY,
    component: OrderHistory,
    layout: UserLayout
  },
  {
    path: USER_PATH.BLOG,
    component: BlogPage,
    layout: UserLayout
  },
  {
    path: USER_PATH.BLOG + '/:id',
    component: BlogDetail,
    layout: UserLayout
  }
]
