import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Agents = React.lazy(() => import('./views/Agents/Agents'))
const CallLogs = React.lazy(() => import('./views/CallLogs/CallLogs'))
const ContactLists = React.lazy(() => import('./views/ContactLists/ContactLists'))
const MyProfile = React.lazy(() => import('./views/pages/profile/MyProfile'));
const ChangePassword = React.lazy(() => import('./views/pages/profile/ChangePassword'));

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/agents', name: 'Agents', element: Agents },
  { path: '/call-logs', name: 'Call Logs', element: CallLogs },
  { path: '/contact-lists', name: 'Contact Lists', element: ContactLists },
  { path: '/my-profile', name: 'My Profile', element: MyProfile },
  { path: '/change-password', name: 'Change Password', element: ChangePassword },

]

export default routes