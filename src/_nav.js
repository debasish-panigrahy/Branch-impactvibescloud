import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilSpeedometer,
  cilUser,
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
    name: 'Customer Visits',
    to: '/customer-visits',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Executives',
    to: '/executives',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

export default _nav
