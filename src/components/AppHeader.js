import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPhone, 
  faMicrophone, 
  faPhoneSlash 
} from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import { AppHeaderDropdown } from './header/index'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function AppHeader() {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const headerRef = useRef(null)
  
  const [isDialerOpen, setIsDialerOpen] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCallActive, setIsCallActive] = useState(false)
  
  const handleDialerClick = () => {
    setIsDialerOpen(true)
  }

  const handleEnableMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsMicEnabled(true)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Microphone Access Required',
        text: 'Please allow microphone access to use the dialer',
      })
    }
  }

  const handleCall = () => {
    if (!phoneNumber) {
      Swal.fire({
        icon: 'warning',
        title: 'No Number Entered',
        text: 'Please enter a number to call',
      })
      return
    }
    
    setIsCallActive(true)
    // Here you would integrate with your calling system
    Swal.fire({
      icon: 'success',
      title: 'Calling...',
      text: `Initiating call to ${phoneNumber}`,
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    Swal.close()
  }

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('shadow-sm', window.scrollY > 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 bg-light border-bottom" ref={headerRef}>
      <CContainer fluid className="px-4">
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <div className="d-flex align-items-center">
          <span className="h3 mb-0 ms-3 text-dark">Impact Vibes</span>
        </div>

        <div className="ms-auto d-flex align-items-center">
          <div 
            className="d-flex align-items-center me-4 px-3 py-2 bg-light rounded-2 hover:bg-primary-subtle cursor-pointer"
            onClick={handleDialerClick}
            role="button"
          >
            <FontAwesomeIcon
              icon={faPhone}
              className="text-primary me-2"
              style={{ fontSize: '1.5rem' }}
            />
            <span className="text-dark fw-semibold fs-5">Dialer</span>
          </div>
          
          {isDialerOpen && (
            <CModal 
              visible={isDialerOpen} 
              onClose={() => !isCallActive && setIsDialerOpen(false)} 
              size="md"
              alignment="center"
              className="dialer-modal"
              backdrop={isCallActive ? 'static' : true}
            >
              <CModalHeader closeButton={!isCallActive} className="border-0 bg-transparent">
                <CModalTitle className="text-center w-100">
                  <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
                  {isCallActive ? 'Ongoing Call' : 'Phone Dialer'}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <div className="text-center">
                  {!isMicEnabled ? (
                    <div className="text-center p-4">
                      <FontAwesomeIcon 
                        icon={faMicrophone} 
                        className="text-primary mb-3"
                        style={{ fontSize: '3rem' }}
                      />
                      <h4 className="mb-3">Microphone Access Required</h4>
                      <p className="text-muted mb-4">To make and receive calls, we need access to your microphone</p>
                      <CButton 
                        color="primary" 
                        size="lg"
                        className="px-4 py-2"
                        onClick={handleEnableMicrophone}
                      >
                        <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                        Enable Microphone
                      </CButton>
                    </div>
                  ) : isCallActive ? (
                    <div className="call-active-screen p-4">
                      <div className="caller-info mb-4">
                        <div className="caller-avatar mb-3">
                          <FontAwesomeIcon 
                            icon={faPhone} 
                            className="text-white"
                            style={{ fontSize: '2rem' }}
                          />
                        </div>
                        <h4 className="mb-2">{phoneNumber}</h4>
                        <p className="text-muted">Ongoing Call</p>
                      </div>
                      <CButton 
                        color="danger" 
                        size="lg" 
                        className="rounded-circle p-3"
                        onClick={handleEndCall}
                      >
                        <FontAwesomeIcon icon={faPhoneSlash} style={{ fontSize: '1.5rem' }} />
                      </CButton>
                    </div>
                  ) : (
                    <div className="dialer-content p-4">
                      <div className="phone-input-container mb-4">
                        <PhoneInput
                          country={'us'}
                          value={phoneNumber}
                          onChange={phone => setPhoneNumber(phone)}
                          enableSearch
                          inputClass="form-control"
                          containerClass="w-100"
                          searchClass="country-search"
                          dropdownClass="country-dropdown"
                          buttonClass="country-button"
                        />
                      </div>
                      <div className="action-buttons">
                        <CButton 
                          color="success"
                          size="lg"
                          className="call-button px-4 py-2 w-100"
                          onClick={handleCall}
                          disabled={!phoneNumber}
                        >
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Call
                        </CButton>
                      </div>
                    </div>
                  )}
                </div>
              </CModalBody>
            </CModal>
          )}
          
          <CHeaderNav>
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
