/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react'
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  ImportOutlined,
  ExportOutlined,
  TeamOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  InboxOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BankOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Typography } from 'antd'
import { ADMIN_PATH } from 'common/constants/paths'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openNotification } from 'common/utils'
import { setLogin } from 'redux/slice/login.slice'
import { useAuth } from 'hooks/useAuth'

const { Header, Content, Sider } = Layout
const { Text } = Typography

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  fnc?: () => void
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    onClick: fnc
  } as MenuItem
}

const itemsMenu: MenuItem[] = [
  getItem(<Link to={ADMIN_PATH.OVERVIEW}>Tổng quan</Link>, '1', <LineChartOutlined />),
  getItem(<Link to={ADMIN_PATH.CUSTOMER}>Khách hàng</Link>, '2', <TeamOutlined />),
  getItem(<Link to={ADMIN_PATH.MANAGER}>Tài khoản</Link>, '3', <UserOutlined />),
  getItem('Bán hàng', 'sub1', <ShopOutlined />, [
    getItem(<Link to={ADMIN_PATH.CATEGORY}>Danh mục</Link>, '4', <AppstoreOutlined />),
    getItem(<Link to={ADMIN_PATH.PRODUCT}>Sản phẩm</Link>, '5', <ShoppingOutlined />),
    getItem(<Link to={ADMIN_PATH.ORDER}>Đơn hàng</Link>, '6', <InboxOutlined />)
  ]),
  getItem('Kho hàng', 'sub2', <BankOutlined />, [
    getItem(<Link to={ADMIN_PATH.WAREHOUSE}>Nhà kho</Link>, '7', <HomeOutlined />),
    getItem(<Link to={ADMIN_PATH.IMPORT_WAREHOUSE}>Nhập hàng</Link>, '8', <ImportOutlined />),
    getItem(<Link to={ADMIN_PATH.SUPPLIER}>Nhà cung cấp</Link>, '9', <ExportOutlined />)
  ])
]

const itemsMenuStaff: MenuItem[] = [
  getItem(<Link to={ADMIN_PATH.ORDER}>Đơn hàng</Link>, '6', <InboxOutlined />),
  getItem('Kho hàng', 'sub2', <BankOutlined />, [
    getItem(<Link to={ADMIN_PATH.WAREHOUSE}>Nhà kho</Link>, '7', <HomeOutlined />),
    getItem(<Link to={ADMIN_PATH.IMPORT_WAREHOUSE}>Nhập hàng</Link>, '8', <ImportOutlined />),
    getItem(<Link to={ADMIN_PATH.SUPPLIER}>Nhà cung cấp</Link>, '9', <ExportOutlined />)
  ])
]

const AdminLayout: React.FC = ({ children }: any) => {
  const [collapsed, setCollapsed] = useState(false)
  const [titleHeader, setTitleHeader] = useState<string>('Tổng quan')
  const [keySider, setKeySider] = useState<string>('1')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useAuth()

  const { pathname } = window.location

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('data')
    dispatch(setLogin(undefined))
    openNotification('success', 'Thành công', 'Đăng xuất thành công!')
    handleNavigate(`${ADMIN_PATH.LOGIN}`)
  }, [dispatch])

  const userMenuItems: MenuItem[] = [
    {
      key: 'profile',
      label: (
        <div className='py-1 px-1'>
          <div className='font-semibold text-gray-800'>{user?.name || 'Admin'}</div>
          <div className='text-xs text-gray-500 capitalize'>{user?.role}</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    getItem('Đăng xuất', 'logout', <LogoutOutlined />, undefined, handleLogout)
  ]

  useEffect(() => {
    if (/^\/ad-e-order\/\d+$/.test(pathname)) {
      setTitleHeader('Chi tiết đơn hàng')
      setKeySider('6')
    } else {
      switch (pathname) {
        case ADMIN_PATH.PRODUCT:
          setTitleHeader('Danh sách sản phẩm')
          setKeySider('5')
          break
        case ADMIN_PATH.CREATE_UPDATE_PRODUCT:
          setTitleHeader('Thêm mới/Cập nhật sản phẩm')
          setKeySider('5')
          break
        case ADMIN_PATH.CATEGORY:
          setTitleHeader('Danh sách danh mục')
          setKeySider('4')
          break
        case ADMIN_PATH.MANAGER:
          setTitleHeader('Danh sách tài khoản quản trị')
          setKeySider('3')
          break
        case ADMIN_PATH.CUSTOMER:
          setTitleHeader('Danh sách khách hàng')
          setKeySider('2')
          break
        case ADMIN_PATH.ORDER:
          setTitleHeader('Danh sách đơn hàng')
          setKeySider('6')
          break
        case ADMIN_PATH.OVERVIEW:
          setTitleHeader('Thống kê báo cáo')
          setKeySider('1')
          break
        case ADMIN_PATH.WAREHOUSE:
          setTitleHeader('Kho hàng')
          setKeySider('7')
          break
        case ADMIN_PATH.IMPORT_WAREHOUSE:
          setTitleHeader('Nhập hàng')
          setKeySider('8')
          break
        case ADMIN_PATH.SUPPLIER:
          setTitleHeader('Nhà cung cấp')
          setKeySider('9')
          break
        default:
          setTitleHeader('Tổng quan')
          setKeySider('1')
      }
    }
  }, [pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── SIDEBAR ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={230}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        {/* Brand / Logo */}
        <div className='flex items-center gap-3 px-4 py-5 border-b' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div
            className='flex items-center justify-center rounded-xl flex-shrink-0'
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              boxShadow: '0 0 12px rgba(59,130,246,0.5)'
            }}
          >
            <BankOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <div className='overflow-hidden'>
              <div className='text-white font-bold text-base leading-tight truncate'>Kim khí Tuấn Thịnh</div>
              <div className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>
                Quản trị hệ thống
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode='inline'
          selectedKeys={[keySider]}
          defaultOpenKeys={['sub1', 'sub2']}
          items={user?.role === 'staff' ? itemsMenuStaff : itemsMenu}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 8,
            color: 'rgba(255,255,255,0.75)'
          }}
          theme='dark'
        />

        {/* User info at bottom */}
        <div
          className='absolute bottom-0 left-0 right-0 border-t p-3 flex items-center gap-3'
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
        >
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', flexShrink: 0 }}
          />
          {!collapsed && (
            <div className='overflow-hidden flex-1 min-w-0'>
              <div className='text-white text-sm font-medium truncate'>{user?.name || 'Admin'}</div>
              <div className='text-xs capitalize truncate' style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user?.role}
              </div>
            </div>
          )}
        </div>
      </Sider>

      {/* ── MAIN AREA ── */}
      <Layout style={{ background: '#f1f5f9' }}>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 64
          }}
        >
          {/* Left: toggle + breadcrumb */}
          <div className='flex items-center gap-4'>
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ width: 40, height: 40, fontSize: 16, color: '#475569' }}
            />
            <div className='flex items-center gap-2'>
              <div
                className='w-1 h-5 rounded-full'
                style={{ background: 'linear-gradient(180deg, #3b82f6, #06b6d4)' }}
              />
              <span className='font-semibold text-gray-700 text-base'>{titleHeader}</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className='flex items-center gap-3'>
            {/* To customer site */}
            <Button
              type='text'
              icon={<HomeOutlined />}
              onClick={() => window.open('/', '_blank')}
              style={{ color: '#64748b' }}
              title='Xem trang khách hàng'
            />

            {/* User dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement='bottomRight' arrow>
              <div className='flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors'>
                <Avatar
                  size={34}
                  icon={<UserOutlined />}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
                />
                <div className='hidden sm:block'>
                  <div className='text-sm font-semibold text-gray-700 leading-tight'>{user?.name || 'Admin'}</div>
                  <div className='text-xs text-gray-400 capitalize leading-tight'>{user?.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            minHeight: 'calc(100vh - 112px)'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
