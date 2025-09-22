import React, { useState, useEffect } from "react";
import { Input, Button, Badge, message, Tag } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

// Component to display current date and time
const CurrentDateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(dateTime);
  const formattedDate = dateTime.toLocaleDateString("en-GB"); // DD/MM/YYYY format

  return (
    <>
      <div>{dayOfWeek}</div>
      <div>{formattedDate}</div>
    </>
  );
};

const { Search } = Input;

const Navbar = ({ title }) => {
  const { currentUser, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationRef = React.useRef(null);

  useEffect(() => {
    // Simulate receiving notifications
    setNotifications([
      { id: 1, message: "New task assigned to you", time: "10 minutes ago" },
      { id: 2, message: "Task status updated", time: "30 minutes ago" },
      { id: 3, message: "Meeting reminder", time: "1 hour ago" },
      { id: 4, message: "Deadline approaching", time: "3 hours ago" },
      { id: 5, message: "New comment on your task", time: "Yesterday" },
    ]);

    // Add click outside listener to close notifications
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSearch = (value) => console.log(value);

  const showNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    // In a real app, you would call an API to mark notifications as read
    message.success("All notifications marked as read");
  };

  // Format welcome message with the user's name if available
  const getWelcomeMessage = () => {
    if (currentUser) {
      return (
        <>
          Welcome back, {currentUser.name || currentUser.username || currentUser.email} 👋
          {isAdmin() && (
            <Tag
              color="red"
              icon={<CrownOutlined />}
              className="admin-role-tag"
            >
              ADMIN
            </Tag>
          )}
        </>
      );
    }
    return title || "Welcome back 👋";
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{getWelcomeMessage()}</h2>
      </div>
      <div className="navbar-center">
        <Search
          placeholder="Search your task here..."
          onSearch={onSearch}
          style={{ width: 400 }}
          prefix={<SearchOutlined />}
          className="search-input"
        />
      </div>
      <div className="navbar-right">
        <div className="navbar-icons">
          <div className="notification-container" ref={notificationRef}>
            <Badge count={notifications.length} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: "20px" }} />}
                size="large"
                className="icon-button"
                onClick={showNotifications}
              />
            </Badge>
            {notificationsVisible && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <div className="notifications-actions">
                    <Button size="small" type="text" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                    <Button
                      size="small"
                      type="text"
                      onClick={clearAllNotifications}
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-content">
                          {notification.message}
                        </div>
                        <div className="notification-time">
                          {notification.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            type="text"
            icon={<CalendarOutlined style={{ fontSize: "20px" }} />}
            size="large"
            className="icon-button"
          />
          <div className="date-display">
            <CurrentDateTime />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
