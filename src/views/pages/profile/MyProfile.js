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
  const [userId, setUserId] = useState(null);

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
  const [sipServer, setSipServer] = useState('');
  const uaRef = useRef(null)

  useEffect(() => {
    const token = isAutheticated();
    if (token) {
      setUserId(token.id);
    }
    getData()
  }, [])

  const fetchStoredSipDetails = async (userId) => {
    try {
      const response = await Axios.get(`/api/sip/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data) {
        setSipServer(response.data.data.sipServer || '');
        setSipUsername(response.data.data.sipUser || '');
        setSipPassword(response.data.data.sipPassword || '');
      }
    } catch (error) {
      console.error('Error fetching stored SIP details:', error);
    }
  };

  const getData = async () => {
    try {
      const res = await Axios.get('/api/v1/user/details')
      if (res.data.success && res.data.user) {
        setUserId(res.data.user._id);

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
        await fetchStoredSipDetails(res.data.user._id);
      }
    } catch (err) {
      console.error('Error fetching user details:', err)
      Swal.fire('Error', 'Failed to fetch user details', 'error')
    }
  }

  const fetchDidNumbers = async (branchId) => {
    try {
      const res = await Axios.get(`/api/branch/get_one/${branchId}`)
      if (res.data.success && res.data.data) {
        const branchData = res.data.data
        if (branchData.didNumber) {
          setDidNumbers([branchData.didNumber])
        } else {
          setDidNumbers([])
        }
      } else {
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
      const res = await Axios.put('/api/v1/user/update/profile', formData, {
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

  const handleSipRegister = async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire('Error', 'User ID not available', 'error');
      return;
    }

    // Fetch extension for selected DID
    console.log('Fetching extension for DID:', sipUsername);
    
    const extension = await fetchExtensionForDid(sipUsername);
    console.log('Fetched extension:', extension);
    
    if (!extension) {
      Swal.fire('Error', 'Could not find extension for selected DID', 'error');
      return;
    }

    try {
      const [serverIP, port] = sipServer.split(':');
      const socket = new JsSIP.WebSocketInterface(`wss://${sipServer}`);

      const configuration = {
        sockets: [socket],
        uri: `sip:${extension}@${serverIP}`,
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

      ua.on('registered', async () => {
        try {
          await Axios.post('/api/sip/create', {
            userId: userId,
            branchId: ownerDetails.branchId,
            sipServer: sipServer,
            sipUser: sipUsername, // This is still the DID, but we want to store extension below
            sipPassword: sipPassword
          });

          // Save SIP details to localStorage for AppHeader.js
          localStorage.setItem('sipDetails', JSON.stringify({
            sipUsername: extension, // <-- store extension, not DID
            sipPassword,
            sipServer
          }));

          Swal.fire('Success', 'SIP Registration successful and details saved', 'success');
        } catch (error) {
          Swal.fire('Warning', 'SIP Registration successful but failed to save details', 'warning');
        }
      });

      ua.on('registrationFailed', (response) => {
        Swal.fire('Error', `Registration failed: ${response.cause}`, 'error');
      });

      ua.start();

    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  const fetchExtensionForDid = async (didNumber) => {
    try {
      const response = await Axios.get(`/api/did-extensions/number/${didNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Assuming response.data.data.extension contains the extension
      if (response.data.success && response.data.data && response.data.data.extension) {
        return response.data.data.extension;
      }
      return null;
    } catch (err) {
      console.error('Error fetching extension for DID:', err);
      return null;
    }
  };

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

                {/* <div className="mt-4">
                  <h4>SIP Details</h4>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>SIP Server</Form.Label>
                      <Form.Control type="text" value={sipServer} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>SIP User</Form.Label>
                      <Form.Control type="text" value={sipUsername} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>SIP Password</Form.Label>
                      <Form.Control type="text" value={sipPassword} readOnly />
                    </Form.Group>
                  </Form>
                </div> */}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  )
}

export default MyProfile