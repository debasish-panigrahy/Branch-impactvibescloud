import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Link as MuiLink,
} from '@mui/material'
import Axios from '../../axios'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import CancelIcon from '@mui/icons-material/Cancel'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { isAutheticated } from '../../auth'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography textAlign="center" variant="h3" gutterBottom>
        Welcome to Impact Vibes!
      </Typography>
    </Box>
  )
}

export default Dashboard
