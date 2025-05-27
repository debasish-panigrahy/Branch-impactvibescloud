import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Axios from '../../axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await Axios.post('/api/v1/user/password/forgot', { email })

      if (res?.status === 200) {
        Swal.fire('success', res?.data?.message, 'success')
        navigate('/login')
      } else if (res?.status === 305) {
        Swal.fire('error', res?.data?.message, 'error')
      }
    } catch (err) {
      Swal.fire('error', 'User Not found with this email ', 'error')
    }
  }
  return (
    <>
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                      <h1>Forget Password</h1>
                      <p className="text-body-secondary">
                        Enter your email we will send you the password
                      </p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          required
                          placeholder="abc@gmail.com"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          name="email"
                          autoComplete="email"
                        />
                      </CInputGroup>

                      <CRow>
                        <CCol xs={12}>
                          <CButton
                            color="primary"
                            type="submit"
                            style={{ width: '100%' }}
                            className="px-4"
                            disabled={loading}
                          >
                            {loading ? <CSpinner variant="grow" /> : 'Generate password '}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <span className="text-body-secondary">
                            If you know you password? Continue to
                          </span>
                          <CButton onClick={() => navigate('/login')} color="link" className="px-2">
                            Sign in?
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  )
}

export default ForgetPassword
