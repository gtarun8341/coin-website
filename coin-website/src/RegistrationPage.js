import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig'; // Adjust the path based on your project structure
import { useLocation, useNavigate } from 'react-router-dom';
import logo from './coin.png'; // Replace with your logo file
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referCode, setReferCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const urlReferCode = new URLSearchParams(location.search).get('referCode');

  // Set the referCode state with the referCode from the URL
  // If there is no referCode in the URL, it will use an empty string
  React.useEffect(() => {
    setReferCode(urlReferCode || '');
  }, [urlReferCode]);

  const register = async () => {
    try {
      const response = await axios.post(`${API_URL}/register`, { username, password, referCode, mobileNumber, email });
      console.log(response.data);
      toast.success('Registered successfully!');
      navigate('/login');
    } catch (error) {
      console.error(error.response.data);
      toast.error(error.response.data); // Display the error message from the server
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
      <h1>Sign up</h1>
      <p style={{ fontSize: '0.8rem', marginBottom: '20px' }}>Create New Etherconnect Account</p>
      <div className="form-group mb-3 w-100">
        <input type="text" className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="form-group mb-3 w-100">
        <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className="form-group mb-3 w-100">
        <input type="text" className="form-control" placeholder="Referral Code (optional)" value={referCode} onChange={e => setReferCode(e.target.value)} />
      </div>
      <div className="form-group mb-3 w-100">
        <input type="text" className="form-control" placeholder="Mobile Number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
      </div>
      <div className="form-group mb-3 w-100">
        <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="btn btn-primary w-100" onClick={register}>Register</button>
      <p style={{ marginTop: '20px' }}>Already have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in instead</span></p>
    </div>
    <div className="col-lg-1 d-none d-lg-block">
      {/* This div will act as a column space */}
    </div>
  </div>
  </>
  );
}

export default RegistrationPage;
