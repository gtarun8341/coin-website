import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import logo from './coin.png'; // Replace with your logo file
import { useNavigate } from 'react-router-dom';

const MyNavbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Remove the token from localStorage
    // localStorage.removeItem('admintoken');
    localStorage.removeItem('token');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <Navbar style={{ backgroundColor: 'darkviolet' }} variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <img
              src={logo}
              width="50"
              height="35"
              className="d-inline-block align-top"
              alt="Your Logo"
            />
          </div>
          <div style={{ color: 'white' }}>
            <div style={{ borderBottom: '2px solid white', paddingBottom: '5px' }}></div>
            {'TARGETCOIN'}
            <div style={{ borderTop: '2px solid white', paddingTop: '5px' }}></div>
          </div>
        </Navbar.Brand>
        <Button onClick={logout}>Logout</Button>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
