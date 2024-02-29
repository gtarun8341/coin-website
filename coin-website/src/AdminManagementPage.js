import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import Sidebar from './Sidebar';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [editAdmin, setEditAdmin] = useState(null);

  useEffect(() => {
    // Fetch admins on component mount
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const jwt = localStorage.getItem('admintoken');
    const response = await axios.get(`${API_URL}/admin/admins`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    setAdmins(response.data);
  };

  const handleAddAdmin = async () => {
    const jwt = localStorage.getItem('admintoken');
    try {
      // Make API call to add a new admin
      const response = await axios.post(
        `${API_URL}/admin/admins`,
        newAdmin,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      if (response.status === 201) {
        // Admin added successfully, update the admins list
        toast.success('Admin added successfully');

        fetchAdmins();
        // Clear the form
        setNewAdmin({
          username: '',
          email: '',
          password: '',
        });
      } else {
        // console.error('Failed to add admin');
        toast.success('Failed to add admin');

      }
    } catch (error) {
      // console.error('Error adding admin:', error);
      toast.success('Error adding admin');

    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const jwt = localStorage.getItem('admintoken');
    try {
      // Make API call to delete admin
      const response = await axios.delete(
        `${API_URL}/admin/admins/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      if (response.status === 200) {
        // Admin deleted successfully, update the admins list
        toast.success('Admin deleted successfully');

        fetchAdmins();
      } else {
        // console.error('Failed to delete admin');
        toast.success('Failed to delete admin');

      }
    } catch (error) {
      // console.error('Error deleting admin:', error);
      toast.error('Error deleting admin');

    }
  };

  const handleEditAdmin = async () => {
    const jwt = localStorage.getItem('admintoken');
    try {
      // Make API call to edit admin
      const response = await axios.put(
        `${API_URL}/admin/admins/${editAdmin._id}`,
        editAdmin,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      if (response.status === 200) {
        // Admin edited successfully, update the admins list
        toast.success('Admin edited successfully');

        fetchAdmins();
        // Close the edit modal
        setEditAdmin(null);
      } else {
        console.error('Failed to edit admin');
        toast.success('Admin added successfully');

      }
    } catch (error) {
      // console.error('Error editing admin:', error);
      toast.error('Error editing admin');

    }
  };

  const openEditModal = (admin) => {
    setEditAdmin({ ...admin });
  };

  const closeEditModal = () => {
    setEditAdmin(null);
  };

  return (
    <>    <ToastContainer />
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container-fluid">
        <h1 className="text-center my-4">Admin Management</h1>
        <div className="row">
          <div className="col-md-8">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <button
                        className="btn btn-danger mr-2"
                        onClick={() => handleDeleteAdmin(admin._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => openEditModal(admin)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-md-4">
            {editAdmin ? (
              <div>
                <h2>Edit Admin</h2>
                <form>
                  <div className="form-group">
                    <label htmlFor="editUsername">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editUsername"
                      value={editAdmin.username}
                      onChange={(e) =>
                        setEditAdmin({ ...editAdmin, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editEmail">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="editEmail"
                      value={editAdmin.email}
                      onChange={(e) =>
                        setEditAdmin({ ...editAdmin, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPassword">Password</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editPassword"
                      value={editAdmin.password}
                      onChange={(e) =>
                        setEditAdmin({ ...editAdmin, password: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEditAdmin}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2>Add New Admin</h2>
                <form>
                  <div className="form-group">
                    <label htmlFor="newUsername">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="newUsername"
                      value={newAdmin.username}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newEmail">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="newEmail"
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">Password</label>
                    <input
                      type="text"
                      className="form-control"
                      id="newPassword"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddAdmin}
                  >
                    Add Admin
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminManagementPage;
