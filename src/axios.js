import axios from 'axios'

const Axios = axios.create({
  // baseURL: 'http://localhost:5040/',
  baseURL: 'https://api-impactvibescloud.onrender.com',
})

export default Axios
