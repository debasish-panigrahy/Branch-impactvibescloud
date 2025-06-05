import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CFormSelect
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faPhoneVolume } from '@fortawesome/free-solid-svg-icons'
import Axios from '../../axios'
import { isAutheticated } from '../../auth'

function CallLogs() {
  const [calls, setCalls] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const token = isAutheticated()

  const getCalls = async () => {
    try {
      const res = await Axios.get('/api/v1/calls', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setCalls(res.data.calls || [])
      }
    } catch (error) {
      console.error('Error fetching calls:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCalls()
  }, [])

  const filteredCalls = calls.filter(call => {
    if (filterType === 'incoming') return call.type === 'incoming'
    if (filterType === 'outgoing') return call.type === 'outgoing'
    return true
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>Call Logs</strong>
              <CFormSelect
                className="w-auto"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Calls</option>
                <option value="incoming">Incoming Calls</option>
                <option value="outgoing">Outgoing Calls</option>
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Phone Number</CTableHeaderCell>
                  <CTableHeaderCell>Duration</CTableHeaderCell>
                  <CTableHeaderCell>Date & Time</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Agent</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredCalls.map((call, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <FontAwesomeIcon
                        icon={call.type === 'incoming' ? faPhone : faPhoneVolume}
                        className={call.type === 'incoming' ? 'text-success' : 'text-primary'}
                      />
                      <span className="ms-2">
                        {call.type.charAt(0).toUpperCase() + call.type.slice(1)}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{call.phoneNumber}</CTableDataCell>
                    <CTableDataCell>{call.duration}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(call.timestamp).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={call.status === 'completed' ? 'success' : 
                                   call.status === 'missed' ? 'danger' : 
                                   'warning'}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{call.agent}</CTableDataCell>
                  </CTableRow>
                ))}
                {filteredCalls.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No calls found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CallLogs
