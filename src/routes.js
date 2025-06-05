import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const MyProfile = React.lazy(() => import('./views/pages/profile/MyProfile'))
const ChangePassword = React.lazy(() => import('./views/pages/profile/ChangePassword'))
const CallLogs = React.lazy(() => import('./views/CallLogs/CallLogs'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/my-profile', name: 'Profile', element: MyProfile },
  { path: '/change-password', name: 'Change password', element: ChangePassword },
  { path: '/agents', name: 'Agents', element: React.lazy(() => import('./views/Agents/Agents')) },
  { path: '/call-logs', name: 'Call Logs', element: CallLogs },
]

export default routes
