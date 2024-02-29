import React from 'react';
import { Navigate } from 'react-router-dom';

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
