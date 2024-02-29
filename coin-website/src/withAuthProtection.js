import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import HomePage from './HomePage';
import BuyPage from './BuyPage';
import AdminPage from './AdminPage';
import AdminTransactionMethodPage from './AdminTransactionMethodPage';
import AdminUserPage from './AdminUserPage';
import AdminManagementPage from './AdminManagementPage';
import AdminLoginPage from './AdminLoginPage';

function withAuthProtection(WrappedComponent, tokenKey, loginPath) {
  return function ProtectedRoute(props) {
    const isLoggedIn = !!localStorage.getItem(tokenKey);

    if (!isLoggedIn) {
      return <Navigate to={loginPath} />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuthProtection;
