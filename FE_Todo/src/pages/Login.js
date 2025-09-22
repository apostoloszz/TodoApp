import React, { useState } from "react";
import { Form, Input, Button, Divider, message } from "antd";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const user = await login(values);
      if (user) {
        message.success(`Welcome back, ${user.username}!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-layout">
        <div className="login-image">
          <img src="/login-illustration.svg" alt="Login Illustration" />
        </div>
        <div className="login-form-container">
          <div className="login-form-content">
            <h1 className="login-title">Đăng nhập</h1>
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input
                  placeholder="Username"
                  size="large"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  placeholder="Password"
                  size="large"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  className="login-button"
                  loading={loading}
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="login-options">
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password ?
                </Link>
              </div>

              <Divider plain>or</Divider>

              <div className="social-login">
                <Button
                  icon={<GoogleOutlined />}
                  size="large"
                  block
                  className="google-button"
                >
                  Continue with Google
                </Button>

                <Button
                  icon={<FacebookOutlined />}
                  size="large"
                  block
                  className="facebook-button"
                >
                  Continue with Facebook
                </Button>
              </div>

              <div className="login-links">
                <span>Don't have an account? </span>
                <Link to="/register" className="register-link">
                  Create One
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
