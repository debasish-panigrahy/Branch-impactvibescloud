import React, { useEffect, useState } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import Axios from '../../axios'
import { isAutheticated } from '../../auth'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const signout = async () => {
    localStorage.removeItem('authToken')
    Swal.fire('success!', 'Logged Out', 'success')
    navigate('/login')
  }
  const [user, setUser] = useState(null)
  const token = isAutheticated()
  const getData = async () => {
    let res = await Axios.get(`/api/v1/user/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.data.success) {
      setUser({ ...res.data.user })
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div className="media d-flex align-items-center " style={{ marginTop: '0.5rem' }}>
          <FontAwesomeIcon
            style={{ fontSize: '2rem' }}
            className="user-avatar md-avatar rounded-circle "
            icon={faUserCircle}
          />
          <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
            <span className="mb-0 font-small fw-bold"> {user?.name}</span>
          </div>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>

        <CDropdownItem onClick={() => navigate('/my-profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/change-password')}>
          <CIcon icon={cilSettings} className="me-2" />
          Change Password
        </CDropdownItem>

        <CDropdownDivider />
        <CDropdownItem onClick={signout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
