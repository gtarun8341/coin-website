import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Replace this with your authentication logic
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  // Check if the token is present and valid
  return token !== null && token !== 'undefined';
};

const PrivateRoute = ({ element: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      element={isAuthenticated() ? (
        <Component />
      ) : (
        <Navigate to="/login" replace />
      )}
    />
  );
};

export default PrivateRoute;
