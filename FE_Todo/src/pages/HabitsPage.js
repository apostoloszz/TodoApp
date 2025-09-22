import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../context/AuthContext";

const HabitsPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Only redirect once we confirm user is authenticated
    if (!loading && currentUser) {
      // Redirect to personal tasks page with habits tab active
      navigate("/personal-tasks?tab=habits");
    }
  }, [navigate, currentUser, loading]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" tip="Loading habits view..." />
    </div>
  );
};

export default HabitsPage;
