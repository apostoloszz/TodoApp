import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineAppstore,
  AiOutlineUser,
  AiOutlineQuestionCircle,
  AiOutlineDashboard,
  AiOutlineTags,
} from "react-icons/ai";
import { BsListTask, BsPencilSquare, BsShieldCheck } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { RiLogoutBoxLine, RiAdminLine } from "react-icons/ri";
import { MdSecurity } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin, currentUser } = useAuth();

  // Check if the route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <Link to="/dashboard">
            {isAdmin() ? (
              <div className="admin-badge">
                <img src="/logo.png" alt="Profile" className="sidebar-avatar" />
                <div className="admin-indicator">ADMIN</div>
              </div>
            ) : (
              <img src="/logo.png" alt="Profile" className="sidebar-avatar" />
            )}
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {/* Common routes for all users */}
            <li className={isActive("/dashboard") ? "active" : ""}>
              <Link to="/dashboard" title="Dashboard">
                <AiOutlineDashboard size={24} />
              </Link>
            </li>
            <li className={isActive("/personal-tasks") ? "active" : ""}>
              <Link to="/personal-tasks" title="My Tasks">
                <BsPencilSquare size={24} />
              </Link>
            </li>
            <li className={isActive("/habits") ? "active" : ""}>
              <Link to="/habits" title="My Habits">
                <BsListTask size={22} />
              </Link>
            </li>

            <li className="menu-divider"></li>

            {/* Admin-only routes */}
            {isAdmin() && (
              <>
                <li className="admin-menu-divider">
                  <span>Admin</span>
                </li>
                <li
                  className={
                    isActive("/users")
                      ? "active admin-menu-item"
                      : "admin-menu-item"
                  }
                >
                  <Link to="/users" title="User Management">
                    <AiOutlineUser size={24} />
                  </Link>
                </li>
                <li
                  className={
                    isActive("/roles")
                      ? "active admin-menu-item"
                      : "admin-menu-item"
                  }
                >
                  <Link to="/roles" title="Role Management">
                    <MdSecurity size={24} />
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin-tasks")
                      ? "active admin-menu-item"
                      : "admin-menu-item"
                  }
                >
                  <Link to="/admin-tasks" title="Admin Task Management">
                    <BsListTask size={24} />
                  </Link>
                </li>
                <li
                  className={
                    isActive("/categories")
                      ? "active admin-menu-item"
                      : "admin-menu-item"
                  }
                >
                  <Link to="/categories" title="Categories Management">
                    <AiOutlineTags size={24} />
                  </Link>
                </li>
              </>
            )}

            {/* Settings available to all users */}
            <li className={isActive("/settings") ? "active" : ""}>
              <Link to="/settings" title="Settings">
                <FiSettings size={24} />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div onClick={handleLogout} className="logout-button">
          <RiLogoutBoxLine size={24} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
