import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from react-router-dom
import logo from './coin.png'; // Replace with your logo file
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Instantiate useNavigate hook

  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { username, password });
      const token  = response.data;
      console.log(token);
      localStorage.setItem('admintoken', token);
      toast.success('Login successful!');

      // Navigate to /admin route and show success toast
      navigate('/admin');
    } catch (error) {
      console.error(error);
  
      // Show error toast
      toast.error('Login failed or incorrect data');
    }
  };
  

  return (
    <>    <ToastContainer />
    <div className="d-flex" style={{ height: '100vh' }}>
      <div className="col-lg-7 d-none d-lg-block">
        {/* Replace with your image */}
        <img src="coin_image.jpg" alt="Coin" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="col-lg-1 d-none d-lg-block">
        {/* This div will act as a column space */}
      </div>
      <div className="col-lg-3 col-12 d-flex flex-column justify-content-center align-items-start" style={{ paddingLeft: '15px' }}>
        {/* Replace with your coin image */}
        <img src={logo} alt="Coin" className="mt-lg-3 mt-0" style={{ width: '50%', height: 'auto', marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '10px' }}>Admin Sign in</h1>
        <p style={{ fontSize: '0.8rem', marginBottom: '20px' }}>with your TARGETCOIN Admin Account</p>
        <div className="form-group mb-3 w-100">
          <input type="text" className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group mb-3 w-100">
          <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" onClick={login}>Sign in</button>
      </div>
      <div className="col-lg-1 d-none d-lg-block">
        {/* This div will act as a column space */}
      </div>
    </div>
    </>

  );
}

export default AdminLoginPage;
