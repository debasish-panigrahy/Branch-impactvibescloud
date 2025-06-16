import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'

function AppSidebar() {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.changeState.sidebarUnfoldable) // ✅ updated
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow) // ✅ updated

  return (
    <CSidebar
      className="sidebar sidebar-fixed bg-dark text-white"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="sidebar-header d-flex align-items-center justify-content-center py-4">
        <CSidebarBrand className="px-4 py-2 w-100" to="/">
          <div className="sidebar-brand-full">
            <span className="h3 mb-0 text-white fw-bold">Impact Vibes</span>
          </div>
        </CSidebarBrand>
        <CCloseButton
          className="d-md-none text-white"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />

      <CSidebarFooter className="d-none d-md-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default AppSidebar
