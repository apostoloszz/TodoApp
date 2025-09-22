import React, { useState } from "react";
import { Form, Input, Button, Divider, message } from "antd";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import authService from "../api/authService";
import "../styles/Register.css";

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match!");
        return;
      }

      setLoading(true);
      const userData = {
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
      };

      await authService.register(userData);
      message.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-layout">
        <div className="register-image">
          <img src="/login-illustration.svg" alt="Register Illustration" />
        </div>
        <div className="register-form-container">
          <div className="register-form-content">
            <h1 className="register-title">Đăng ký</h1>
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              className="register-form"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input
                  placeholder="Name"
                  size="large"
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input
                  placeholder="Username"
                  size="large"
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Email"
                  size="large"
                  className="register-input"
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
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm Password"
                  size="large"
                  className="register-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  className="register-button"
                  loading={loading}
                >
                  Đăng ký
                </Button>
              </Form.Item>

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

              <div className="register-links">
                <Link to="/login" className="login-link">
                  More
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
