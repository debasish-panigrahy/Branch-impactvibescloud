import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faEnvelope, faLockOpen, faUnlockAlt } from '@fortawesome/free-solid-svg-icons'
import { Col, Row, Form, Card, Button, Container, InputGroup } from '@themesberg/react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import { Routes } from '../../routes'

import Swal from 'sweetalert2'
import { isAutheticated } from '../../../auth'
import Axios from '../../../axios'
// import Axios from '../../axios'

const ChangePassword = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = isAutheticated()
  const [user, setUser] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    confirmPasswordError: '',
    newPasswordError: '',
    oldPasswordError: '',
    passwordMismatchError: '',
  })
  const validEmailRegex = RegExp(
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
  )
  const validPasswordRegex = RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{7,}$/)
  const handleChange = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'oldPassword':
        setErrors({
          ...errors,
          oldPasswordError: validPasswordRegex.test(value)
            ? ''
            : 'Password Shoud Be 8 Characters Long, Atleast One Uppercase, Atleast One Lowercase,Atleast One Digit, Atleast One Special Character',
        })

        break
      case 'newPassword':
        setErrors({
          ...errors,
          newPasswordError: validPasswordRegex.test(value)
            ? ''
            : 'Password Shoud Be 8 Characters Long, Atleast One Uppercase, Atleast One Lowercase,Atleast One Digit, Atleast One Special Character',
        })

        break
      case 'confirmPassword':
        setErrors({
          ...errors,
          confirmPasswordError: validPasswordRegex.test(value)
            ? ''
            : 'Password should be 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
          passwordMismatchError: value !== user.newPassword ? 'Passwords do not match' : '',
        })
        break
      default:
        break
    }

    setUser({ ...user, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!(user.oldPassword && user.newPassword && user.confirmPassword)) {
      return Swal.fire('Error!', 'All fields are required', 'error')
    }

    if (!(user.newPassword.length >= 8)) {
      return Swal.fire('Error!', 'New password must be 8 characters long', 'error')
    }

    if (user.newPassword !== user.confirmPassword) {
      return Swal.fire('Error!', 'New Password and Confirm Password do not match!', 'error')
    }

    setLoading(true)

    try {
      const res = await Axios.put(
        '/api/v1/user/password/update',
        { ...user },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log(res)
      if (res?.data.success) {
        Swal.fire({
          title: 'Done',
          text: 'Password Changed',
          icon: 'success',
          confirmButtonText: 'ok',
          confirmButtonColor: '#303c54',
          iconColor: '#303c54',
        }).then(() => {
          navigate('/dashboard')
        })
      }
    } catch (error) {
      Swal.fire('Error!', error.response?.data.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
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
            <Col
              xs={12}
              style={{ maxWidth: '600px' }}
              className="d-flex align-items-center justify-content-center"
            >
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <h3 className="mb-4">Change Password</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Old Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faLockOpen} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="password"
                        placeholder="old password"
                        name="oldPassword"
                        value={user.oldPassword}
                        onChange={handleChange}
                        pattern="^(?=.*[a-z](){}[])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="The password should have 1 upper-case letter, 1 lower-case letter, 1 number, 1 special character and at least 8 characters."
                      />
                    </InputGroup>
                  </Form.Group>
                  {errors.oldPasswordError && (
                    <p className="text-center py-2 text-danger">{errors.oldPasswordError}</p>
                  )}
                  <Form.Group id="password" className="mb-4">
                    <Form.Label>New Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faLockOpen} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="password"
                        placeholder="new password"
                        name="newPassword"
                        value={user.newPassword}
                        onChange={handleChange}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="The password should have 1 upper-case letter, 1 lower-case letter, 1 number, 1 special character and at least 8 characters."
                      />
                    </InputGroup>
                  </Form.Group>
                  {errors.newPasswordError && (
                    <p className="text-center py-2 text-danger">{errors.newPasswordError}</p>
                  )}
                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faLockOpen} />
                      </InputGroup.Text>
                      <Form.Control
                        required
                        type="password"
                        placeholder="Confirm password"
                        name="confirmPassword"
                        value={user.confirmPassword}
                        onChange={handleChange}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="The password should have 1 upper-case letter, 1 lower-case letter, 1 number, 1 special character and at least 8 characters."
                      />
                    </InputGroup>
                  </Form.Group>
                  {errors.confirmPasswordError && (
                    <p className="text-center py-2 text-danger">{errors.confirmPasswordError}</p>
                  )}

                  <Button variant="primary" type="submit" className="w-100">
                    {loading ? <>Loading...</> : <> Change Password </>}
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

export default ChangePassword
