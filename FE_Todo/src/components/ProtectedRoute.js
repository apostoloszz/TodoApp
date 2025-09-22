import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

/**
 * Protected route component that checks authentication
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render if authenticated
 * @param {Array<string>} [props.requiredRoles] Optional array of roles required to access this route
 * @returns {React.ReactElement} Rendered component
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { currentUser, isAdmin, hasRole, loading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading authentication..." />
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log("ProtectedRoute: No current user found, redirecting to login");
    return <Navigate to="/login" />;
  }

  // If route requires specific roles
  if (requiredRoles.length > 0) {
    // Check for admin access (admins can access everything)
    if (isAdmin()) {
      return children;
    }

    // Check for specific roles
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
