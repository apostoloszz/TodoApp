import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">
          <img src="/logo.svg" alt="Tick to do list Logo" />
        </div>
        <h1 className="landing-title">Welcome to Tick to do list</h1>
        <div className="landing-actions">
          <Link to="/login">
            <Button type="primary" className="landing-button">
              New To Do List
            </Button>
          </Link>
        </div>
        <div className="landing-footer">
          <Link to="/" className="social-icon">
            <i className="fab fa-facebook"></i>
          </Link>
          <Link to="/" className="social-icon">
            <i className="fab fa-youtube"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
