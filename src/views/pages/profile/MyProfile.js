import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faEnvelope,
  faLockOpen,
  faMobile,
  faUnlockAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { Col, Row, Form, Card, Button, Container, InputGroup } from '@themesberg/react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { isAutheticated } from '../../../auth'
import Axios from '../../../axios'
import Swal from 'sweetalert2'
// import { Axios } from 'axios'
// import Axios from '../../axios'
// import { Routes } from '../../routes'

// import Swal from 'sweetalert2'

const MyProfile = () => {
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagesPreview, setImagesPreview] = useState()
  const token = isAutheticated()

  const [ownerDetails, setOwnerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const history = useNavigate()

  const getData = async () => {
    let res = await Axios.get(`/api/v1/user/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.data.success) {
      setOwnerDetails({ ...res.data.user })

      if (res.data.user.avatar) {
        setImagesPreview(res.data.user.avatar.url)
      }
    }
  }
  const handleChange = (event) => {
    const { name, value } = event.target
    setOwnerDetails({ ...ownerDetails, [name]: value })
  }
  async function handleSubmit(e) {
    e.preventDefault()
    if (ownerDetails.name === '' || ownerDetails.email === '' || ownerDetails.phone === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Fill all mandatory fields',
        icon: 'error',
        button: 'Close',
        dangerMode: true,
      })
      return
    }
    const formData = new FormData()
    formData.append('name', ownerDetails.name)
    formData.append('email', ownerDetails.email)
    formData.append('phone', ownerDetails.phone)

    setLoading(true)
    try {
      const res = await Axios.put(`/api/v1/user/update/profile`, formData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/formdata',
        },
      })
      if (res.data.success === true) {
        setLoading(false)
        Swal.fire({
          title: 'Edited',
          text: 'Profile Edited Successfully!',
          icon: 'success',
          button: 'Return',
        })
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong!'
      setLoading(false)
      Swal.fire({
        title: 'Warning',
        text: message,
        icon: 'error',
        button: 'Retry',
        dangerMode: true,
      })
    }
  }

  const handleCancle = () => {
    Navigate('/dashboard')
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <main>
      <section className="bg-soft d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center">
            <p className="text-center">
              <Card.Link as={Link} to={'/dashboard'} className="text-gray-700">
                <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back to Dashboard
              </Card.Link>
            </p>
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <h3 className="mb-4">Profile</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="name" className="mb-4">
                    <Form.Label>Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Your Name"
                        name="name"
                        value={ownerDetails.name}
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        autoFocus
                        required
                        type="email"
                        placeholder="example@gmail.com"
                        name="email"
                        value={ownerDetails.email}
                        onChange={handleChange}
                        // pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        title="Please enter a valid email address"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group id="mobile" className="mb-4">
                    <Form.Label>Mobile Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faMobile} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="tel"
                        placeholder="Your Mobile Number"
                        name="phone"
                        value={ownerDetails.phone}
                        onChange={handleChange}
                        // pattern="[0-9]{10}" // Assuming a 10-digit mobile number, adjust as needed
                        title="Please enter a valid 10-digit mobile number"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100">
                    {loading ? <>Loading...</> : <>Update</>}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  )
}

export default MyProfile
