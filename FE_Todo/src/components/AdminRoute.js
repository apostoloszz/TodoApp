import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Admin route component that checks if the current user has admin rights
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render if user is admin
 * @returns {React.ReactElement} Rendered component
 */
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user has admin role
  if (!isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
