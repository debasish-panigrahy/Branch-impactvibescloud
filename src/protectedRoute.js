/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token)
    console.log('Decoded Token:', decodedToken) // Debugging
    const currentTime = Date.now() / 1000
    console.log('Current Time:', currentTime) // Debugging
    console.log('Token Expiration Time:', decodedToken.exp) // Debugging
    return decodedToken.exp < currentTime
  } catch (error) {
    console.error('Error decoding token:', error) // Debugging
    return true // If there's an error decoding the token, consider it expired
  }
}

const ProtectedRoute = ({ element: Element }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('authToken')
      console.log('Token:', token) // Debugging
      if (!token || isTokenExpired(token)) {
        console.log('Token is expired or not present, redirecting to login')
        navigate('/login')
      } else {
        console.log('Token is valid')
      }
    }

    checkToken()
  }, [navigate])

  return <Element />
}

export default ProtectedRoute
