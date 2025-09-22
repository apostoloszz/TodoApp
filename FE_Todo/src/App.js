import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import AdminTaskManagement from "./pages/AdminTaskManagement";
import PersonalTasks from "./pages/PersonalTasks";
import Categories from "./pages/Categories";
import HabitsPage from "./pages/HabitsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal-tasks"
              element={
                <ProtectedRoute>
                  <PersonalTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <HabitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <Categories />
                </AdminRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <AdminRoute>
                  <Roles />
                </AdminRoute>
              }
            />
            <Route
              path="/admin-tasks"
              element={
                <AdminRoute>
                  <AdminTaskManagement />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
