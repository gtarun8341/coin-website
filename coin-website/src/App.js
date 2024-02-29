import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import HomePage from './HomePage';
import BuyPage from './BuyPage';
import AdminPage from './AdminPage';
import AdminTransactionMethodPage from './AdminTransactionMethodPage';
import AdminUserPage from './AdminUserPage';
import AdminManagementPage from './AdminManagementPage';
import AdminLoginPage from './AdminLoginPage';
import withAuthProtection from './withAuthProtection';

function App() {
  const ProtectedHomePage = withAuthProtection(HomePage, 'token', '/login');
  const ProtectedBuyPage = withAuthProtection(BuyPage, 'token', '/login');
  const ProtectedAdminPage = withAuthProtection(AdminPage, 'admintoken', '/adminlogin');
  const ProtectedAdminTransactionMethodPage = withAuthProtection(AdminTransactionMethodPage, 'admintoken', '/adminlogin');
  const ProtectedAdminUserPage = withAuthProtection(AdminUserPage, 'admintoken', '/adminlogin');
  const ProtectedAdminManagementPage = withAuthProtection(AdminManagementPage, 'admintoken', '/adminlogin');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/" element={<ProtectedHomePage />} />
        <Route path="/buy" element={<ProtectedBuyPage />} />
        <Route path="/admin" element={<ProtectedAdminPage />} />
        <Route path="/detail" element={<ProtectedAdminTransactionMethodPage />} />
        <Route path="/adminuser" element={<ProtectedAdminUserPage />} />
        <Route path="/manageadmin" element={<ProtectedAdminManagementPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;