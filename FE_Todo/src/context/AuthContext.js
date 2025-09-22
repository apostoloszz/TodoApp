import React, { createContext, useState, useContext, useEffect } from "react";
import userService from "../api/userService";
import authService from "../api/authService";

// Create context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      console.log("AuthContext: Checking authentication");

      if (authService.isAuthenticated()) {
        console.log("AuthContext: Token found, fetching user data");
        try {
          const user = await userService.getCurrentUser();
          console.log("AuthContext: User data fetched successfully", user);
          setCurrentUser(user);

          // Extract roles from user
          const roles = user.roles ? user.roles.map((role) => role.name) : [];
          setUserRoles(roles);
        } catch (error) {
          console.error("AuthContext: Error fetching user data:", error);
          authService.logout(); // Logout on error
        }
      } else {
        console.log("AuthContext: No token found or invalid token");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userRoles.some((role) => role === "ADMIN" || role === "ROLE_ADMIN");
  };

  // Update context on login
  const login = async (credentials) => {
    console.log("AuthContext: Logging in user");
    const response = await authService.login(credentials);
    if (response) {
      console.log("AuthContext: Login successful, fetching user data");
      const user = await userService.getCurrentUser();
      console.log("AuthContext: User data retrieved", user);
      setCurrentUser(user);
      const roles = user.roles ? user.roles.map((role) => role.name) : [];
      setUserRoles(roles);
      return user;
    }
    console.log("AuthContext: Login failed");
    return null;
  };

  // Clear context on logout
  const logout = () => {
    console.log("AuthContext: Logging out user");
    authService.logout();
    setCurrentUser(null);
    setUserRoles([]);
    console.log("AuthContext: User logged out, state cleared");
  };

  const value = {
    currentUser,
    userRoles,
    hasRole,
    isAdmin,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
