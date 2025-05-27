import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Avatar,
  Typography,
  Card,
  TextField,
  MenuItem,
} from "@mui/material";
import Axios from "../../axios";
import Swal from "sweetalert2";

const FacesTable = () => {
  const [faces, setFaces] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branchId, setbranchId] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await Axios.get('/api/v1/user/details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
            console.log(res.data.user,"userId")
          setbranchId(res.data.user.branchId);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [token]);

  const fetchFaces = async (currentPage) => {
    try {
      console.log(branchId, "branchId");
      const response = await Axios.get(
        `/api/faces/get/${branchId}?page=${currentPage}&limit=5&device=${selectedDevice}&startDate=${startDate}&endDate=${endDate}`
      );
      if (response.data.success) {
        const { data, pagination } = response.data;
        setFaces(data);
        setTotalPages(pagination.totalPages);
      } else {
        setFaces([]); // Clear faces if success is false
        setTotalPages(1); // Reset pagination
        console.error("No data available");
      }
    } catch (error) {
      console.error("Error fetching faces:", error);
      setFaces([]); // Clear faces on error
      setTotalPages(1); // Reset pagination
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await Axios.get(`/api/device/get/${branchId}`);
      if (response.data.success) {
        console.log("Devices response:", response); // Debugging log
        const devicesData = response.data.devices || []; // Ensure devicesData is an array
        setDevices(devicesData); // Set devices data
        console.log("Devices:", devicesData); // Debugging log
      } else {
        setDevices([]); // Clear devices if success is false
        console.error("No devices available");
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      setDevices([]); // Clear devices on error
    }
};

  useEffect(() => {
    fetchFaces(page);
    fetchDevices();
  }, [page,branchId]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewImage = (photoUrl) => {
    Swal.fire({
      title: "Captured Image",
      imageUrl: photoUrl,
      imageAlt: "Captured Face",
      showCloseButton: true,
    });
  };

  const handleFilter = () => {
    fetchFaces(1); // Reset to the first page when applying filters
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <Box component={Card} p={3}>
      {/* Title */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Visited Customers
        </Typography>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} justifyContent="space-between">
        <Box display="flex" gap={2}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <TextField
            label="Device"
            placeholder="Device"
            select
            value={selectedDevice} // Use selectedDevice for the dropdown value
            onChange={(e) => setSelectedDevice(e.target.value)} // Update selectedDevice
            sx={{ minWidth: 200 }} // Set a minimum width for better appearance
          >
            <MenuItem value="">All Devices</MenuItem>
            {devices.map((device) => (
              <MenuItem key={device._id} value={device.deviceId}>
                {device.deviceId}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearDates}>
            Clear Dates
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Photo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Device ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Branch</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Captured Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faces.length > 0 ? (
              faces.map((face) => (
                <TableRow key={face._id}>
                  <TableCell>
                    <Avatar src={face.photoUrl} alt="Face" />
                  </TableCell>
                  <TableCell>{face.deviceId || "Unknown"}</TableCell>
                  <TableCell>{face.branchId?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {new Date(face.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewImage(face.photoUrl)}
                    >
                      View Image
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} />
      </Box>
    </Box>
  );
};

export default FacesTable;