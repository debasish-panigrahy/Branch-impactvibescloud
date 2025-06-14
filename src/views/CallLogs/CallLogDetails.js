import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CRow,
  CCol
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faUser, faBuilding, faClock, faMoneyBill, faComment } from '@fortawesome/free-solid-svg-icons'

function CallLogDetails({ isOpen, onClose, callLog }) {
  if (!callLog) return null
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <CModal visible={isOpen} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Call Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                  <div>
                    <div className="text-medium-emphasis small">Contact</div>
                    <div className="fw-bold">{callLog.contactName || 'No name'}</div>
                    <div>{callLog.contactNumber || 'No number'}</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  <div>
                    <div className="text-medium-emphasis small">Agent</div>
                    <div className="fw-bold">{callLog.user || callLog.agentName || 'N/A'}</div>
                    <div className="small">{callLog.agentId || ''}</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                  <div>
                    <div className="text-medium-emphasis small">Team</div>
                    <div className="fw-bold">{callLog.team || 'Not assigned'}</div>
                  </div>
                </div>
              </CCol>
              
              <CCol md={6}>
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                  <div>
                    <div className="text-medium-emphasis small">Call Time</div>
                    <div className="fw-bold">{formatDate(callLog.contactedOn || callLog.createdAt)}</div>
                    <div className="d-flex align-items-center">
                      <span className={`badge ${callLog.callType === 'Missed' ? 'bg-danger' : 
                                              callLog.callType === 'Incoming' ? 'bg-success' : 'bg-primary'} me-2`}>
                        {callLog.callType || 'Unknown'}
                      </span>
                      <span>Duration: {formatDuration(callLog.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faMoneyBill} className="me-2 text-primary" />
                  <div>
                    <div className="text-medium-emphasis small">Cost</div>
                    <div className="fw-bold">{callLog.cost ? `₹${callLog.cost}` : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="text-medium-emphasis small">
                    <div>Virtual Number:</div>
                    <div className="fw-bold">{callLog.virtualNumber || 'N/A'}</div>
                  </div>
                </div>
              </CCol>
            </CRow>
            
            {callLog.notes && (
              <CRow className="mt-3">
                <CCol>
                  <div className="d-flex">
                    <FontAwesomeIcon icon={faComment} className="me-2 text-primary mt-1" />
                    <div>
                      <div className="text-medium-emphasis small">Notes</div>
                      <div className="border rounded p-3 bg-light">
                        {callLog.notes}
                      </div>
                    </div>
                  </div>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Close</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CallLogDetails
