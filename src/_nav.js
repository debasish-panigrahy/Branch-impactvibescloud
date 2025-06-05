import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilPhone,
} from '@coreui/icons'
import {CNavItem} from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Agents',
    to: '/agents',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Call Logs',
    to: '/call-logs',
    icon: <CIcon icon={cilPhone} customClassName="nav-icon" />,
  },
]

export default _nav
