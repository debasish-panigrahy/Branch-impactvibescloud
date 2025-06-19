import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faEnvelope, faMobile, faUser } from '@fortawesome/free-solid-svg-icons'
import { Col, Row, Form, Card, Button, Container, InputGroup } from '@themesberg/react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { isAutheticated } from '../../../auth'
import Axios from '../../../axios'
import Swal from 'sweetalert2'
import JsSIP from 'jssip'

const MyProfile = () => {
  const [loading, setLoading] = useState(false)
  const [imagesPreview, setImagesPreview] = useState()
  const [didNumbers, setDidNumbers] = useState([])

  const token = isAutheticated()
  const navigate = useNavigate()

  const [ownerDetails, setOwnerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
  })

  const [sipUsername, setSipUsername] = useState('')
  const [sipPassword, setSipPassword] = useState('')
  const [sipServer, setSipServer] = useState('')

  const uaRef = useRef(null)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      const res = await Axios.get(`/api/v1/user/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success && res.data.user) {
        setOwnerDetails({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          phone: res.data.user.phone || '',
          branchId: res.data.user.branchId || '',
        })
        if (res.data.user.avatar?.url) {
          setImagesPreview(res.data.user.avatar.url)
        }
        if (res.data.user.branchId) {
          fetchDidNumbers(res.data.user.branchId)
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err.response?.data || err.message)
    }
  }

  const fetchDidNumbers = async (branchId) => {
    try {
      const res = await Axios.get(`/api/branch/get_one/${branchId}`)
      console.log('Branch API Response:', res.data)

      if (res.data.success && res.data.data) {
        const branchData = res.data.data
        if (branchData.didNumber) {
          console.log('Found DID number:', branchData.didNumber)
          setDidNumbers([branchData.didNumber])
        } else {
          console.warn('No DID number found in branch data')
          setDidNumbers([])
        }
      } else {
        console.warn('Invalid API response format:', res.data)
        setDidNumbers([])
      }
    } catch (err) {
      console.error('Error fetching DID numbers:', err)
      setDidNumbers([])
      Swal.fire('Error', 'Failed to fetch DID number', 'error')
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setOwnerDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, phone } = ownerDetails

    if (!name || !email || !phone) {
      Swal.fire('Warning', 'Fill all mandatory fields', 'error')
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('phone', phone)

    setLoading(true)
    try {
      const res = await Axios.put(`/api/v1/user/update/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data.success) {
        Swal.fire('Success', 'Profile updated successfully!', 'success')
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong!'
      Swal.fire('Error', message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSipRegister = (e) => {
    e.preventDefault();

    try {
      // Split server and port
      const [serverIP, port] = sipServer.split(':');
      
      // Create WebSocket connection
      const socket = new JsSIP.WebSocketInterface(`wss://${sipServer}`);
      
      const configuration = {
        sockets: [socket],
        // Don't include port in SIP URI domain
        uri: `sip:${sipUsername}@${serverIP}`,
        password: sipPassword,
        register: true,
        register_expires: 30,
        realm: serverIP,
        user_agent: 'My SIP Client',
        log: {
          builtinEnabled: false,
          level: 'error'
        }
      };

      const ua = new JsSIP.UA(configuration);

      // Add event handlers
      ua.on('registered', () => {
        console.log('Successfully registered');
        Swal.fire('Success', 'SIP Registration successful', 'success');
      });

      ua.on('registrationFailed', (response) => {
        console.error('Registration failed:', response);
        Swal.fire('Error', `Registration failed: ${response.cause}`, 'error');
      });

      ua.start();

    } catch (err) {
      console.error('SIP initialization error:', err);
      Swal.fire('Error', err.message, 'error');
    }
  }

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
            <Col xs={12} md={8} lg={6}>
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100">
                <h3 className="mb-4">Profile</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="name" className="mb-4">
                    <Form.Label>Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FontAwesomeIcon icon={faUser} /></InputGroup.Text>
                      <Form.Control required type="text" placeholder="Your Name" name="name" value={ownerDetails.name} onChange={handleChange} />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FontAwesomeIcon icon={faEnvelope} /></InputGroup.Text>
                      <Form.Control required type="email" placeholder="example@gmail.com" name="email" value={ownerDetails.email} onChange={handleChange} />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="phone" className="mb-4">
                    <Form.Label>Phone</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FontAwesomeIcon icon={faMobile} /></InputGroup.Text>
                      <Form.Control required type="tel" placeholder="Your Mobile Number" name="phone" value={ownerDetails.phone} onChange={handleChange} />
                    </InputGroup>
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Form>

                <Form onSubmit={handleSipRegister}>
                  <h4 className="mt-4">SIP Registration</h4>
                  <Form.Group id="sipServer" className="mb-4">
                    <Form.Label>SIP Server</Form.Label>
                    <Form.Control type="text" placeholder="Enter SIP Server (e.g., 192.168.1.1:5066)" value={sipServer} onChange={(e) => setSipServer(e.target.value)} />
                  </Form.Group>
                  <Form.Group id="sipUsername" className="mb-4">
                    <Form.Label>SIP Username</Form.Label>
                    <Form.Select value={sipUsername} onChange={e => setSipUsername(e.target.value)}>
                      <option disabled value="">Select DID Number</option>
                      {didNumbers.map(did => (
                        <option key={did} value={did}>{did}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group id="sipPassword" className="mb-4">
                    <Form.Label>SIP Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter SIP Password" value={sipPassword} onChange={(e) => setSipPassword(e.target.value)} />
                  </Form.Group>
                  <Button variant="success" type="submit" className="w-100">
                    Register SIP
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
