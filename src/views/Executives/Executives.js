import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import debounce from "lodash.debounce";

// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Axios from "../../axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const CustomerExecutives = () => {
  const navigate = useNavigate();
  const nameRef = useRef();
  const [executives, setExecutives] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [branchId, setbranchId] = useState("");
  const [newExecutive, setNewExecutive] = useState({ name: "", email: "", password: "" });
  const [suspendedStatus, setSuspendedStatus] = useState({});
  const token = localStorage.getItem("authToken");
  const totalPages = Math.ceil(filteredUsers.length / itemPerPage);
  const startIdx = (currentPage - 1) * itemPerPage;
  const currentUsers = filteredUsers.slice(startIdx, startIdx + itemPerPage);


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


  // Fetch all executives
  const fetchExecutives = async () => {
    try {
      const { data } = await Axios.get(`/api/executive/all?branchId=${branchId}`,{headers: { Authorization: `Bearer ${token}` }});
      setExecutives(data.executives);
      setFilteredUsers(data.executives);
    } catch (error) {
      console.error("Error fetching executives:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
    if (branchId){
    fetchExecutives();
  }}, [branchId]);

  const debouncedSearch = useCallback(
    debounce(() => {
      const searchTerm = nameRef.current.value.toLowerCase();
      const filtered = executives.filter((user) =>
        user.name.toLowerCase().includes(searchTerm)
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }, 300),
    [executives]
  );

  const handleSearchChange = () => {
    debouncedSearch();
  };

  const toggleSuspend = async (id) => {
    try {
      const executive = executives.find((exec) => exec._id === id);
      const currentStatus = executive.status;
      const newStatus = currentStatus === "active" ? "suspended" : "active";

      await Axios.put(`/api/executive/status/${id}`, { status: newStatus });

      // Update both executives and filteredUsers state
      const updateStatus = (arr) =>
        arr.map((exec) =>
          exec._id === id ? { ...exec, status: newStatus } : exec
        );

      setExecutives((prev) => updateStatus(prev));
      setFilteredUsers((prev) => updateStatus(prev));

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await Axios.put(`/api/executive/edit/${selectedUser._id}`, selectedUser);
      fetchExecutives(); // Refresh the list
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error saving executive:", error);
    }
  };

  const handleAddSave = async () => {
    try {
      await Axios.post("/api/executive/create", newExecutive);
      fetchExecutives(); // Refresh the list
      setAddModalOpen(false);
      setNewExecutive({ name: "", email: "", password: "" }); // Reset form
    } catch (error) {
      console.error("Error adding executive:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Axios.delete(`/api/executive/delete/${id}`);
      fetchExecutives(); // Refresh the list
    } catch (error) {
      console.error("Error deleting executive:", error);
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await Axios.put(`/api/executive/resetpassword/${id}`);
      alert("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>All Customer Executives</h2>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddModalOpen(true)}
            >
              Add Executive
            </Button>
          </div>

          <div className="row mb-3">
            <div className="col-lg-1">
              <select
                className="form-control"
                value={itemPerPage}
                onChange={(e) => {
                  setItemPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-3">
              <input
                type="text"
                ref={nameRef}
                onChange={handleSearchChange}
                placeholder="Search by name"
                className="form-control"
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead style={{ background: "#d9f3f3" }}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date Registered</th>
                  <th>Last Logged In</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.executive.name}</td>
                      <td>{user.executive.email}</td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        {user.lastLoggedIn
                          ? new Date(user.lastLoggedIn).toLocaleString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-info btn-sm me-2"
                          title="Edit"
                          onClick={() => handleEdit(user)}
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => toggleSuspend(user._id)}
                          title={user.status === "suspended" ? "Activate" : "Suspend"}
                        >
                          {user.status === "suspended" ? (
                            <LockOpenIcon fontSize="small" />
                          ) : (
                            <LockIcon fontSize="small" />
                          )}
                        </button>
                        <button
                          className="btn btn-danger btn-sm me-2"
                          title="Delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          title="Reset Password"
                          onClick={() => handleResetPassword(user._id)}
                        >
                          <RestartAltIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Customer Executive Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              Showing {currentUsers.length} of {filteredUsers.length} entries
            </div>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, idx) => (
                <li
                  key={idx}
                  className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>
                    {idx + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box sx={modalStyle}>
          <h2>Edit Executive</h2>
          <TextField
            fullWidth
            label="Name"
            value={selectedUser?.name || ""}
            onChange={(e) =>
              setSelectedUser((prev) => ({ ...prev, name: e.target.value }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={selectedUser?.email || ""}
            onChange={(e) =>
              setSelectedUser((prev) => ({ ...prev, email: e.target.value }))
            }
            margin="normal"
          />
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSave}
              className="me-2"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Add Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <Box sx={modalStyle}>
          <h2>Add Executive</h2>
          <TextField
            fullWidth
            label="Name"
            value={newExecutive.name}
            onChange={(e) =>
              setNewExecutive((prev) => ({ ...prev, name: e.target.value }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={newExecutive.email}
            onChange={(e) =>
              setNewExecutive((prev) => ({ ...prev, email: e.target.value }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newExecutive.password}
            onChange={(e) =>
              setNewExecutive((prev) => ({ ...prev, password: e.target.value }))
            }
            margin="normal"
          />
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddSave}
              className="me-2"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default CustomerExecutives;
