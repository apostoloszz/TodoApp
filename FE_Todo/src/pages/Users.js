import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Tag,
  Select,
  Card,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import userService from "../api/userService";
import adminTaskService from "../api/adminTaskService";
import roleService from "../api/roleService";
import statusService from "../api/statusService";
import { useAuth } from "../context/AuthContext";
import "../styles/Users.css";

const { TabPane } = Tabs;

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [taskForm] = Form.useForm();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      // Ensure we're setting an array, even if the API returns null/undefined
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Failed to fetch users. Please try again.");
      // Set empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all statuses for task management
  const fetchStatuses = async () => {
    try {
      const data = await statusService.getAllStatuses();
      // Ensure we're setting an array, even if the API returns null/undefined
      setStatuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      // Set empty array on error
      setStatuses([]);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
    if (isAdmin()) {
      fetchStatuses();
    }
  }, []);

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success("User updated successfully!");
      } else {
        await userService.createUser(values);
        message.success("User created successfully!");
      }
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      message.error("Failed to save user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user edit
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
    });
    setModalVisible(true);
  };

  // Handle user delete
  const handleDelete = (userId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          await userService.deleteUser(userId);
          message.success("User deleted successfully!");
          fetchUsers();
        } catch (error) {
          console.error("Failed to delete user:", error);
          message.error("Failed to delete user. Please try again.");
        }
      },
    });
  };

  // Fetch tasks for a specific user (admin only)
  const fetchUserTasks = async (userId) => {
    if (!isAdmin()) return;

    try {
      setTaskLoading(true);
      const tasks = await adminTaskService.getTasksByUser(userId);
      // Ensure we're setting an array, even if the API returns null/undefined
      setUserTasks(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
      console.error("Failed to fetch user tasks:", error);
      message.error("Failed to fetch user's tasks. Please try again.");
      // Set empty array on error
      setUserTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  // Handle view user tasks (admin only)
  const handleViewTasks = (user) => {
    setSelectedUser(user);
    fetchUserTasks(user.id);
    setTaskModalVisible(true);
  };

  // Handle task status update (admin only)
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await adminTaskService.updateTaskStatusAsAdmin(taskId, newStatus);
      message.success("Task status updated successfully!");
      fetchUserTasks(selectedUser.id); // Refresh tasks
    } catch (error) {
      console.error("Failed to update task status:", error);
      message.error("Failed to update task status. Please try again.");
    }
  };

  // Handle task edit (admin only)
  const handleTaskEdit = (task) => {
    taskForm.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
    });

    Modal.confirm({
      title: "Edit Task",
      content: (
        <Form form={taskForm} layout="vertical">
          <Form.Item name="title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              {statuses.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = await taskForm.validateFields();
        try {
          await adminTaskService.updateTaskAsAdmin(task.id, values);
          message.success("Task updated successfully!");
          fetchUserTasks(selectedUser.id); // Refresh tasks
        } catch (error) {
          console.error("Failed to update task:", error);
          message.error("Failed to update task. Please try again.");
        }
      },
    });
  };

  // Handle task delete (admin only)
  const handleTaskDelete = (taskId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this task?",
      onOk: async () => {
        try {
          await adminTaskService.deleteTaskAsAdmin(taskId);
          message.success("Task deleted successfully!");
          fetchUserTasks(selectedUser.id); // Refresh tasks
        } catch (error) {
          console.error("Failed to delete task:", error);
          message.error("Failed to delete task. Please try again.");
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => (
        <>
          {roles &&
            roles.map((role) => (
              <Tag
                color={role.name === "ADMIN" ? "gold" : "blue"}
                key={role.id}
              >
                {role.name}
              </Tag>
            ))}
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {isAdmin() && (
            <Button
              type="primary"
              icon={<TagOutlined />}
              onClick={() => handleViewTasks(record)}
            >
              Tasks
            </Button>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Users Management" />

        <div className="users-container">
          <div className="card">
            <div className="table-header">
              <h2>Users</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Add User
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={users || []}
              rowKey={(record) => record?.id || Math.random()}
              loading={loading}
              bordered
            />
          </div>
        </div>

        {/* User Form Modal */}
        <Modal
          title={editingUser ? "Edit User" : "Add User"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input the username!" },
              ]}
            >
              <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input the email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please input the password!" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingUser ? "Update" : "Create"}
                </Button>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* User Tasks Modal (Admin only) */}
        {isAdmin() && (
          <Modal
            title={`Tasks for ${selectedUser?.name || ""}`}
            open={taskModalVisible}
            onCancel={() => setTaskModalVisible(false)}
            footer={null}
            width={800}
          >
            <div className="task-statistics">
              <Card className="task-stat-card pending">
                <h3>Pending</h3>
                <div className="value">
                  {
                    (userTasks || []).filter(
                      (task) => task.status === "PENDING"
                    ).length
                  }
                </div>
              </Card>
              <Card className="task-stat-card progress">
                <h3>In Progress</h3>
                <div className="value">
                  {
                    (userTasks || []).filter(
                      (task) => task.status === "IN_PROGRESS"
                    ).length
                  }
                </div>
              </Card>
              <Card className="task-stat-card completed">
                <h3>Completed</h3>
                <div className="value">
                  {
                    (userTasks || []).filter(
                      (task) => task.status === "COMPLETED"
                    ).length
                  }
                </div>
              </Card>
            </div>
            <Tabs defaultActiveKey="all">
              <TabPane tab="All Tasks" key="all">
                <Table
                  dataSource={userTasks || []}
                  loading={taskLoading}
                  rowKey={(record) => record?.id || Math.random()}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    {
                      title: "Title",
                      dataIndex: "title",
                      key: "title",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                      ellipsis: true,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => {
                        let color = "default";
                        let icon = <ClockCircleOutlined />;

                        if (status === "COMPLETED") {
                          color = "success";
                          icon = <CheckCircleOutlined />;
                        } else if (status === "IN_PROGRESS") {
                          color = "processing";
                          icon = <SyncOutlined spin />;
                        } else if (status === "PENDING") {
                          color = "warning";
                          icon = <ClockCircleOutlined />;
                        }

                        return (
                          <Badge
                            status={color}
                            text={
                              <Space>
                                {icon}
                                {status.replace("_", " ")}
                              </Space>
                            }
                          />
                        );
                      },
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleTaskEdit(record)}
                          >
                            Edit
                          </Button>
                          <Select
                            size="small"
                            style={{ width: 120 }}
                            placeholder="Change status"
                            onChange={(value) =>
                              handleTaskStatusChange(record.id, value)
                            }
                            value={record.status}
                          >
                            {statuses.map((status) => (
                              <Select.Option key={status.id} value={status.id}>
                                {status.name}
                              </Select.Option>
                            ))}
                          </Select>
                          <Button
                            type="primary"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleTaskDelete(record.id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane tab="Pending" key="pending">
                <Table
                  dataSource={(userTasks || []).filter(
                    (task) => task?.status === "PENDING"
                  )}
                  loading={taskLoading}
                  rowKey={(record) => record?.id || Math.random()}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    {
                      title: "Title",
                      dataIndex: "title",
                      key: "title",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                      ellipsis: true,
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleTaskEdit(record)}
                          >
                            Edit
                          </Button>
                          <Select
                            size="small"
                            style={{ width: 120 }}
                            placeholder="Change status"
                            onChange={(value) =>
                              handleTaskStatusChange(record.id, value)
                            }
                            value={record.status}
                          >
                            {statuses.map((status) => (
                              <Select.Option key={status.id} value={status.id}>
                                {status.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane tab="In Progress" key="inProgress">
                <Table
                  dataSource={(userTasks || []).filter(
                    (task) => task?.status === "IN_PROGRESS"
                  )}
                  loading={taskLoading}
                  rowKey={(record) => record?.id || Math.random()}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    {
                      title: "Title",
                      dataIndex: "title",
                      key: "title",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                      ellipsis: true,
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleTaskEdit(record)}
                          >
                            Edit
                          </Button>
                          <Select
                            size="small"
                            style={{ width: 120 }}
                            placeholder="Change status"
                            onChange={(value) =>
                              handleTaskStatusChange(record.id, value)
                            }
                            value={record.status}
                          >
                            {statuses.map((status) => (
                              <Select.Option key={status.id} value={status.id}>
                                {status.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane tab="Completed" key="completed">
                <Table
                  dataSource={(userTasks || []).filter(
                    (task) => task?.status === "COMPLETED"
                  )}
                  loading={taskLoading}
                  rowKey={(record) => record?.id || Math.random()}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    {
                      title: "Title",
                      dataIndex: "title",
                      key: "title",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                      ellipsis: true,
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleTaskEdit(record)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleTaskDelete(record.id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>
            </Tabs>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Users;
