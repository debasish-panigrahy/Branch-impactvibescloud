import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Agents = React.lazy(() => import('./views/Agents/Agents'))
const CallLogs = React.lazy(() => import('./views/CallLogs/CallLogs'))
const ContactLists = React.lazy(() => import('./views/ContactLists/ContactLists'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/agents', name: 'Agents', element: Agents },
  { path: '/call-logs', name: 'Call Logs', element: CallLogs },
  { path: '/contact-lists', name: 'Contact Lists', element: ContactLists }
]

export default routes