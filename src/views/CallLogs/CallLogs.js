import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faDownload, faFileAlt, faCalendarAlt, faPlus } from '@fortawesome/free-solid-svg-icons'
import './CallLogsWebpage.css'
import Axios from '../../axios'
import { isAutheticated } from '../../auth'
import CallLogDetails from './CallLogDetails'
import CreateCallLog from './createCallLog'

function CallLogs() {
  const [callLogs, setCallLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [callTypeFilter, setCallTypeFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [agentIdFilter, setAgentIdFilter] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCallLog, setSelectedCallLog] = useState(null)
  
  const token = isAutheticated()
  const fetchBusinessId = useCallback(async () => {
    try {
      // No need to explicitly set Authorization header as it's handled by axios interceptor
      const res = await Axios.get('/api/v1/user/details')
      if (res.data.success) {
        setBusinessId(res.data.user.branchId)
      }
    } catch (error) {
      console.error('Failed to fetch business ID:', error)
      handleApiError(error)
    }
  }, [])
  const fetchCallLogs = useCallback(async () => {
    if (!businessId) return
    
    setIsLoading(true)
    try {
      const params = {
        businessId,
        page: currentPage,
        limit: rowsPerPage,
      }
      
      if (debouncedSearchText) params.search = debouncedSearchText
      if (callTypeFilter) params.callType = callTypeFilter
      if (teamFilter) params.team = teamFilter
      if (agentIdFilter) params.agentId = agentIdFilter
      if (selectedDate) params.date = selectedDate

      // No need to explicitly set Authorization header as it's handled by axios interceptor
      const response = await Axios.get('/api/call-logs', { params })
      
      if (response.data.success) {
        setCallLogs(response.data.data || [])
        setTotalRecords(response.data.pagination?.totalRecords || 0)
        setTotalPages(response.data.pagination?.totalPages || 0)
      } else {
        handleApiResponse(response.data)
        setCallLogs([])
        setTotalRecords(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Failed to fetch call logs:', error)
      handleApiError(error)
      setCallLogs([])
      setTotalRecords(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [businessId, currentPage, rowsPerPage, debouncedSearchText, callTypeFilter, teamFilter, agentIdFilter, selectedDate, token])

  useEffect(() => {
    fetchBusinessId()
  }, [fetchBusinessId])

  useEffect(() => {
    fetchCallLogs()
  }, [fetchCallLogs])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchText])
  
  useEffect(() => {
    setCurrentPage(1)
    fetchCallLogs()
  }, [debouncedSearchText])

  useEffect(() => {
    if (!token) {
      showErrorToast('Authentication required. Please log in.')
    }
  }, [token])

  const data = callLogs
  const handleSearchChange = (event) => {
    setSearchText(event.target.value)
    setCurrentPage(1)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setCurrentPage(1)
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
    setCurrentPage(1)
  }

  const handleCallTypeChange = (event) => {
    setCallTypeFilter(event.target.value)
    setCurrentPage(1)
  }

  const handleTeamChange = (event) => {
    setTeamFilter(event.target.value)
    setCurrentPage(1)
  }

  const handleAgentChange = (event) => {
    setAgentIdFilter(event.target.value)
    setCurrentPage(1)
  }
  const clearFilters = () => {
    setSearchText('')
    setCallTypeFilter('')
    setTeamFilter('')
    setAgentIdFilter('')
    setSelectedDate('')
    setCurrentPage(1)
  }  // No test data loading functions in production
  
  const downloadExcel = () => {
    if (callLogs.length === 0) {
      alert('No data available to download')
      return
    }

    const headers = ['Contact', 'Contacted On', 'User', 'Virtual Number', 'Team', 'Duration', 'Cost (INR)']
    const csvContent = [
      headers.join(','),
      ...callLogs.map(log => [
        log.contact || log.contactName || log.contactNumber || 'N/A',
        log.contactedOn || (log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'),
        log.user || log.agentName || log.agentId || 'N/A',
        log.virtualNumber || 'N/A',
        log.team || 'N/A',
        log.duration || 'N/A',
        log.cost || 'N/A'
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `call-logs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDateForInput = (date) => {
    if (!date) return ''
    if (typeof date === 'string') return date
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const currentLogs = isLoading ? [] : callLogs

  const handleApiResponse = (response) => {
    const { messageType, message } = response
    
    if (!messageType || !message) {
      showInfoToast('Operation completed')
      return
    }
    
    switch (messageType) {
      case 'success':
        showSuccessToast(message)
        break
      case 'error':
        showErrorToast(message)
        break
      case 'warning':
        showWarningToast(message)
        break
      case 'info':
        showInfoToast(message)
        break
      default:
        showInfoToast(message)
    }
  }

  const handleApiError = (error) => {
    console.error('API Error:', error)
    
    if (!navigator.onLine) {
      showErrorToast('Network connection lost. Please check your internet connection.')
      return
    }
    
    if (error.response) {
      const status = error.response.status
      
      if (status === 401 || status === 403) {
        showErrorToast('Authentication error. Please login again.')
      } else if (status === 404) {
        showErrorToast('Resource not found.')
      } else if (status >= 500) {
        showErrorToast('Server error. Please try again later.')
      } else {
        showErrorToast(error.response.data?.message || 'An error occurred.')
      }
    } else if (error.request) {
      showErrorToast('No response from server. Please try again.')
    } else {
      showErrorToast('An error occurred. Please try again.')
    }
  }

  const showSuccessToast = (message) => {
    alert(`Success: ${message}`)
  }

  const showErrorToast = (message) => {
    alert(`Error: ${message}`)
  }

  const showWarningToast = (message) => {
    alert(`Warning: ${message}`)
  }

  const showInfoToast = (message) => {
    alert(`Info: ${message}`)
  }

  const handleOpenCreateModal = () => {
    setShowCreateModal(true)
  }
  
  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }
  
  const handleCallLogCreated = () => {
    fetchCallLogs()
  }

  const handleViewDetails = (log) => {
    setSelectedCallLog(log)
    setShowDetailsModal(true)
  }
  
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CRow className="align-items-center">
              <CCol xs={12} md={8} className="d-flex flex-wrap gap-2 mb-3 mb-md-0 filter-bar">
                <CFormSelect aria-label="Call type select" className="filter-select" value={callTypeFilter} onChange={handleCallTypeChange}>
                  <option value="">Call type</option>
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                  <option value="Missed">Missed</option>
                </CFormSelect>
                <CFormSelect aria-label="Team select" className="filter-select" value={teamFilter} onChange={handleTeamChange}>
                  <option value="">Team</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                </CFormSelect>
                <CFormSelect aria-label="Users select" className="filter-select" value={agentIdFilter} onChange={handleAgentChange}>
                  <option value="">Users</option>
                  <option>Active Users</option>
                  <option>Inactive Users</option>
                  <option>All Users</option>
                </CFormSelect>
                <CFormSelect aria-label="Tags select" className="filter-select">
                  <option>Tags</option>
                  <option>Important</option>
                  <option>Follow-up</option>
                  <option>Urgent</option>
                </CFormSelect>
                <CButton color="light" variant="outline" onClick={clearFilters}>
                  Clear all
                </CButton>
              </CCol>
              <CCol xs={12} md={4} className="d-flex justify-content-md-end">
                <div className="datepicker-wrapper">
                  <FontAwesomeIcon icon={faCalendarAlt} className="datepicker-icon" />
                  <CFormInput
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    onChange={handleDateChange}
                    max={getTodayDate()}
                    className="form-control"
                  />
                </div>
              </CCol>
            </CRow>
            <CRow className="mt-3 align-items-center">
              <CCol xs={12} md={10}>
                <div className="search-bar" style={{maxWidth: '400px'}}>
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <CFormInput
                    type="search"
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                </div>
              </CCol>              <CCol xs={12} md={2} className="d-flex justify-content-end mt-3 mt-md-0">                <CButton color="light" variant="outline" onClick={downloadExcel} className="me-2">
                  <FontAwesomeIcon icon={faDownload} />
                </CButton>
                <CButton color="primary" onClick={handleOpenCreateModal}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Log Call
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {isLoading && (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {!isLoading && (
              <div className="table-responsive">
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>CONTACT</CTableHeaderCell>
                      <CTableHeaderCell>CONTACTED ON</CTableHeaderCell>
                      <CTableHeaderCell>USER</CTableHeaderCell>
                      <CTableHeaderCell>VIRTUAL NUMBER</CTableHeaderCell>
                      <CTableHeaderCell>TEAM</CTableHeaderCell>
                      <CTableHeaderCell>DURATION</CTableHeaderCell>
                      <CTableHeaderCell>COST (IN INR)</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentLogs.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          <div className="no-data-container">
                            <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-2" />
                            <div>No data</div>
                            <div>No records found for selection.</div>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentLogs.map((log, index) => (
                        <CTableRow 
                          key={index} 
                          onClick={() => handleViewDetails(log)}
                          style={{ cursor: 'pointer' }}
                          className="hover-highlight"
                        >
                          <CTableDataCell>{log.contact || log.contactName || log.contactNumber || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{log.contactedOn || (log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A')}</CTableDataCell>
                          <CTableDataCell>{log.user || log.agentName || log.agentId || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{log.virtualNumber || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{log.team || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{log.duration || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{log.cost || 'N/A'}</CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}
            <CRow className="mt-3 align-items-center">
              <CCol xs={12} md={6} className="d-flex align-items-center">
                <span>Rows per page:</span>
                <CFormSelect
                  className="ms-2"
                  style={{ width: 'auto' }}
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
                <span>
                  {currentLogs.length > 0 ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalRecords)}` : '0'} of {totalRecords}
                </span>
                <CButton color="light" variant="outline" className="ms-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  &lt;
                </CButton>
                <CButton
                  color="light"
                  variant="outline"
                  className="ms-2"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  &gt;
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CreateCallLog 
        isOpen={showCreateModal} 
        onClose={handleCloseCreateModal} 
        onSuccess={handleCallLogCreated}
        businessId={businessId}
      />
      <CallLogDetails
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        callLog={selectedCallLog}
      />
    </CRow>
  )
}

export default CallLogs
