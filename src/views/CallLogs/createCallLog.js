import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CFormFeedback
} from '@coreui/react'
import Axios from '../../axios'
import { isAutheticated } from '../../auth'

function CreateCallLog({ isOpen, onClose, onSuccess, businessId }) {
  const [formData, setFormData] = useState({
    contactNumber: '',
    contactName: '',
    callType: 'Outgoing',
    duration: '',
    virtualNumber: '',
    team: '',
    notes: '',
    cost: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Define required fields with their error messages
  const requiredFields = {
    contactNumber: 'Contact number is required',
    callType: 'Call type is required',
    duration: 'Duration is required',
    cost: 'Cost is required'
  }

  // Validate the form data
  const validateForm = () => {
    const errors = {}
    let isValid = true

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]) {
        errors[field] = requiredFields[field]
        isValid = false
      }
    })

    // Additional validation for numeric fields
    if (formData.duration && isNaN(Number(formData.duration))) {
      errors.duration = 'Duration must be a number'
      isValid = false
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      errors.cost = 'Cost must be a number'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      const token = isAutheticated()
      if (!token) {
        setErrorMessage('Authentication required. Please log in.')
        setIsLoading(false)
        return
      }
      
      // Map the frontend field names to API field names
      const payload = {
        contact: formData.contactNumber,  // API expects 'contact' field
        contactName: formData.contactName,
        callType: formData.callType,
        duration: formData.duration ? Number(formData.duration) : 0,
        virtualNumber: formData.virtualNumber,
        team: formData.team,
        notes: formData.notes,
        cost: formData.cost ? Number(formData.cost) : 0,
        business: businessId,
        createdAt: new Date().toISOString()
      }
      
      const response = await Axios.post('/api/call-logs', payload)
      
      if (response.data.success) {
        setSuccessMessage('Call log created successfully')
        onSuccess()
        
        // Reset form to initial state
        setFormData({
          contactNumber: '',
          contactName: '',
          callType: 'Outgoing',
          duration: '',
          virtualNumber: '',
          team: '',
          notes: '',
          cost: ''
        })
        
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setErrorMessage(response.data.message || 'Failed to create call log')
      }
    } catch (error) {
      console.error('Failed to create call log:', error)
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`)
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage('No response from server. Please check your connection and try again.')
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CModal alignment="center" visible={isOpen} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Log a New Call</CModalTitle>
      </CModalHeader>      <CModalBody>
        {errorMessage && (
          <CAlert color="danger" dismissible onClose={() => setErrorMessage('')}>
            {errorMessage}
          </CAlert>
        )}
        
        {successMessage && (
          <CAlert color="success" dismissible onClose={() => setSuccessMessage('')}>
            {successMessage}
          </CAlert>
        )}
        
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel htmlFor="contactNumber">Contact Number*</CFormLabel>
            <CFormInput
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              required
              invalid={!!formErrors.contactNumber}
            />
            {formErrors.contactNumber && (
              <CFormFeedback invalid>{formErrors.contactNumber}</CFormFeedback>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="contactName">Contact Name</CFormLabel>
            <CFormInput
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="Enter contact name"
            />
          </div>          <div className="mb-3">
            <CFormLabel htmlFor="callType">Call Type</CFormLabel>
            <CFormSelect
              id="callType"
              name="callType"
              value={formData.callType}
              onChange={handleChange}
              invalid={!!formErrors.callType}
            >
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
              <option value="Missed">Missed</option>
            </CFormSelect>
            {formErrors.callType && (
              <CFormFeedback invalid>{formErrors.callType}</CFormFeedback>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="duration">Duration (seconds)*</CFormLabel>
            <CFormInput
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Enter call duration in seconds"
              invalid={!!formErrors.duration}
              min="0"
            />
            {formErrors.duration && (
              <CFormFeedback invalid>{formErrors.duration}</CFormFeedback>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="virtualNumber">Virtual Number</CFormLabel>
            <CFormInput
              type="text"
              id="virtualNumber"
              name="virtualNumber"
              value={formData.virtualNumber}
              onChange={handleChange}
              placeholder="Enter virtual number"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="team">Team</CFormLabel>
            <CFormSelect
              id="team"
              name="team"
              value={formData.team}
              onChange={handleChange}
            >
              <option value="">Select Team</option>
              <option value="Sales">Sales</option>
              <option value="Support">Support</option>
              <option value="Marketing">Marketing</option>
            </CFormSelect>
          </div>          <div className="mb-3">
            <CFormLabel htmlFor="cost">Cost (INR)*</CFormLabel>
            <CFormInput
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Enter call cost"
              invalid={!!formErrors.cost}
              min="0"
              step="0.01"
            />
            {formErrors.cost && (
              <CFormFeedback invalid>{formErrors.cost}</CFormFeedback>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="notes">Notes</CFormLabel>
            <CFormTextarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any notes about the call"
              rows={3}
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton 
          color="primary" 
          onClick={handleSubmit} 
          disabled={isLoading || !formData.contactNumber}
        >
          {isLoading ? 'Creating...' : 'Save Call Log'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CreateCallLog
