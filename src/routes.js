import React from 'react'

import CustomerVisits from './views/CustomerVisits/CustomerVisits'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const MyProfile = React.lazy(() => import('./views/pages/profile/MyProfile'))
const ChangePassword = React.lazy(() => import('./views/pages/profile/ChangePassword'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/my-profile', name: 'Profile', element: MyProfile },
  { path: '/change-password', name: 'Change password', element: ChangePassword },
  
  //customer visits
  {path: '/customer-visits', name: 'Customer Visits', element: CustomerVisits},
  //executives
  {path: '/executives', name: 'Executives', element: React.lazy(() => import('./views/Executives/Executives'))},
]

export default routes
