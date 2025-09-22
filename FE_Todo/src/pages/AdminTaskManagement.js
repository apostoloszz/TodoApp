import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Badge,
  DatePicker,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import adminTaskService from "../api/adminTaskService";
import statusService from "../api/statusService";
import priorityService from "../api/priorityService";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminTaskManagement.css";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminTaskManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [createTaskForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    if (!isAdmin()) {
      message.error("You don't have permission to access this page.");
      return;
    }

    try {
      setLoading(true);
      const data = await adminTaskService.getAllUsers();

      if (Array.isArray(data)) {
        setUsers(data);
        if (data.length === 0) {
          message.info("No users found in the system.");
        }
      } else {
        console.warn("User data returned is not an array:", data);
        setUsers([]);
        message.warning("Unexpected data format returned from the server.");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);

      // Provide more specific error information
      let errorMsg = "Failed to fetch users. ";
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          errorMsg = "Authentication required. Please log in again.";
        } else if (error.response.status === 403) {
          errorMsg = "You don't have permission to access user data.";
        } else if (error.response.status === 404) {
          errorMsg = "User data endpoint not found.";
        } else {
          errorMsg += `Server returned status ${error.response.status}.`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg += "No response received from server. Check your connection.";
      } else {
        // Something happened in setting up the request
        errorMsg += error.message || "Unknown error occurred.";
      }

      message.error(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statuses
  const fetchStatuses = async () => {
    try {
      const data = await statusService.getAllStatuses();
      setStatuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      setStatuses([]);
    }
  };

  // Fetch priorities
  const fetchPriorities = async () => {
    try {
      const data = await priorityService.getAllPriorities();
      setPriorities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch priorities:", error);
      setPriorities([]);
    }
  };

  // Fetch tasks for a specific user
  const fetchUserTasks = async (userId, status = null) => {
    try {
      setTaskLoading(true);
      let tasks;
      let endpoint = "";

      if (status && status !== "all") {
        endpoint = `getTasksByUserAndStatus (userId=${userId}, status=${status})`;
        tasks = await adminTaskService.getTasksByUserAndStatus(userId, status);
      } else {
        endpoint = `getTasksByUser (userId=${userId})`;
        tasks = await adminTaskService.getTasksByUser(userId);
      }

      if (Array.isArray(tasks)) {
        setUserTasks(tasks);
        if (tasks.length === 0) {
          message.info(
            status
              ? `No ${status.toLowerCase()} tasks found for this user.`
              : "No tasks found for this user."
          );
        }
      } else {
        console.warn(`Tasks data from ${endpoint} is not an array:`, tasks);
        setUserTasks([]);
        message.warning("Unexpected task data format returned from server.");
      }
    } catch (error) {
      console.error("Failed to fetch user tasks:", error);

      // Provide more specific error information
      let errorMsg = "Failed to fetch user's tasks. ";
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = "Authentication required. Please log in again.";
        } else if (error.response.status === 403) {
          errorMsg = "You don't have permission to access these tasks.";
        } else if (error.response.status === 404) {
          errorMsg = "User's tasks not found.";
        } else {
          errorMsg += `Server returned status ${error.response.status}.`;
        }
      } else if (error.request) {
        errorMsg += "No response received from server. Check your connection.";
      } else {
        errorMsg += error.message || "Unknown error occurred.";
      }

      message.error(errorMsg);
      setUserTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      // First, check if we can access the admin users endpoint
      message.loading({ content: "Testing API connection...", key: "apiTest" });
      try {
        await adminTaskService.getAllUsers();
        message.success({
          content: "API connection successful!",
          key: "apiTest",
        });
        return true;
      } catch (connectionError) {
        if (
          connectionError.response &&
          connectionError.response.status === 405
        ) {
          // Method Not Allowed, likely an issue with the endpoint
          message.error({
            content:
              "API error: Method not supported. Please check the backend controller.",
            key: "apiTest",
            duration: 10,
          });
          console.error(
            "Method not allowed error. The GET method may not be properly implemented on the backend:",
            connectionError
          );
        }
        throw connectionError; // rethrow to be caught by the outer catch
      }
    } catch (error) {
      let errorMsg = "API connection failed: ";
      if (error.response) {
        errorMsg += `Status ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        errorMsg += "No response from server";
      } else {
        errorMsg += error.message || "Unknown error";
      }

      message.error({ content: errorMsg, key: "apiTest", duration: 5 });
      console.error("API connection test failed:", error);
      return false;
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    // Test connection first
    testApiConnection().then((success) => {
      if (success) {
        fetchUsers();
        fetchStatuses();
        fetchPriorities();
      }
    });
  }, []);

  // Handle user selection
  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setActiveTab("all");
    fetchUserTasks(userId);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (selectedUser) {
      if (key !== "all") {
        fetchUserTasks(selectedUser.id, key);
      } else {
        fetchUserTasks(selectedUser.id);
      }
    }
  };

  // Handle task edit
  const handleEditTask = (task) => {
    console.log("Editing task:", task);
    setEditingTask(task);

    // Handle priority data properly
    const priorityId =
      task.priority?.id ||
      (typeof task.priority === "number" ? task.priority : null);

    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority, // 👈 enum string
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });

    setModalVisible(true);
  };

  // Handle task update
  const handleTaskUpdate = async (values) => {
    try {
      setLoading(true);
      console.log("Updating task with values:", values);

      // Format data according to backend expectations
      const formattedValues = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority || "MEDIUM", // Default to MEDIUM if not provided
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        // Properly format category if provided
        category: values.categoryId ? { id: values.categoryId } : null,
        // Set user to the selected user
        user: { id: selectedUser.id },
      };

      await adminTaskService.updateTaskAsAdmin(editingTask.id, formattedValues);
      message.success("Task updated successfully!");
      setModalVisible(false);
      fetchUserTasks(selectedUser.id, activeTab !== "all" ? activeTab : null);
    } catch (error) {
      console.error("Failed to update task:", error);
      message.error("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, status) => {
    try {
      await adminTaskService.updateTaskStatusAsAdmin(taskId, status);
      message.success("Task status updated successfully!");
      fetchUserTasks(selectedUser.id, activeTab !== "all" ? activeTab : null);
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update status. Please try again.");
    }
  };

  // Handle task delete
  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this task?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await adminTaskService.deleteTaskAsAdmin(taskId);
          message.success("Task deleted successfully!");
          fetchUserTasks(
            selectedUser.id,
            activeTab !== "all" ? activeTab : null
          );
        } catch (error) {
          console.error("Failed to delete task:", error);
          message.error("Failed to delete task. Please try again.");
        }
      },
    });
  };

  // Handle create task for user
  const handleCreateTask = async (values) => {
    try {
      setLoading(true);
      console.log("Creating task with values:", values);

      // Format data according to backend expectations
      const formattedValues = {
        title: values.title,
        description: values.description,
        status: values.status || "PENDING", // Default to PENDING if not provided
        priority: values.priority || "MEDIUM", // Default to MEDIUM if not provided
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        // Properly format category if provided
        category: values.categoryId ? { id: values.categoryId } : null,
      };

      await adminTaskService.createTaskForUser(
        selectedUser.id,
        formattedValues
      );
      message.success("Task created successfully!");
      setCreateTaskModalVisible(false);
      createTaskForm.resetFields();
      fetchUserTasks(selectedUser.id, activeTab !== "all" ? activeTab : null);
    } catch (error) {
      console.error("Failed to create task:", error);
      message.error("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get status tag color
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "processing";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  // Task columns for the table
  const taskColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
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
        let color = getStatusColor(status);
        let icon = <ClockCircleOutlined />;

        if (status === "COMPLETED") {
          icon = <CheckCircleOutlined />;
        } else if (status === "IN_PROGRESS") {
          icon = <SyncOutlined spin />;
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
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) => {
        if (!dueDate) return <span>Not set</span>;
        const date = new Date(dueDate);
        return (
          <span>
            <CalendarOutlined style={{ marginRight: 5 }} />
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        if (!priority) return <Tag color="default">None</Tag>;

        let color;
        switch (priority) {
          case "HIGH":
            color = "red";
            break;
          case "MEDIUM":
            color = "orange";
            break;
          case "LOW":
            color = "green";
            break;
          default:
            color = "default";
        }

        return <Tag color={color}>{priority}</Tag>;
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
            onClick={() => handleEditTask(record)}
          >
            Edit
          </Button>
          <Select
            size="small"
            style={{ width: 120 }}
            value={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            {statuses.map((status) => (
              <Select.Option key={status.id} value={status.id}>
                {status.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTask(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-task-page">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Task Management" />
        {!isAdmin() ? (
          <div className="unauthorized-message">
            <Title level={4}>Unauthorized Access</Title>
            <Text type="secondary">
              You don't have permission to access this page.
            </Text>
          </div>
        ) : (
          <div className="admin-task-container">
            <Row gutter={16}>
              <Col span={6}>
                <Card
                  title="Users"
                  className="users-list-card"
                  extra={
                    <Button
                      type="primary"
                      icon={<SyncOutlined />}
                      size="small"
                      onClick={() =>
                        testApiConnection().then((success) => {
                          if (success) fetchUsers();
                        })
                      }
                      loading={loading}
                    >
                      Refresh
                    </Button>
                  }
                >
                  {loading ? (
                    <div className="center-spinner">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <ul className="users-list">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <li
                            key={user.id}
                            className={`user-item ${
                              selectedUser?.id === user.id ? "active" : ""
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            <UserOutlined /> {user.name}
                            <div className="user-email">{user.email}</div>
                          </li>
                        ))
                      ) : (
                        <div className="empty-state small">
                          <Text type="secondary">No users found</Text>
                          <Button type="link" onClick={() => fetchUsers()}>
                            Refresh
                          </Button>
                        </div>
                      )}
                    </ul>
                  )}
                </Card>
              </Col>
              <Col span={18}>
                {selectedUser ? (
                  <Card
                    title={`Tasks for ${selectedUser.name}`}
                    className="tasks-card"
                  >
                    <div
                      className="tabs-actions"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          createTaskForm.resetFields();
                          setCreateTaskModalVisible(true);
                        }}
                      >
                        Create Task
                      </Button>
                      <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        size="small"
                        onClick={() => {
                          if (selectedUser) {
                            fetchUserTasks(
                              selectedUser.id,
                              activeTab !== "all" ? activeTab : null
                            );
                          }
                        }}
                        loading={taskLoading}
                      >
                        Refresh Tasks
                      </Button>
                    </div>
                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                      <TabPane tab="All Tasks" key="all">
                        <Table
                          dataSource={userTasks || []}
                          columns={taskColumns}
                          rowKey={(record) => record?.id || Math.random()}
                          loading={taskLoading}
                          pagination={{ pageSize: 10 }}
                        />
                      </TabPane>
                      <TabPane tab="Pending" key="PENDING">
                        <Table
                          dataSource={(userTasks || []).filter(
                            (task) => task?.status === "PENDING"
                          )}
                          columns={taskColumns}
                          rowKey={(record) => record?.id || Math.random()}
                          loading={taskLoading}
                          pagination={{ pageSize: 10 }}
                        />
                      </TabPane>
                      <TabPane tab="In Progress" key="IN_PROGRESS">
                        <Table
                          dataSource={(userTasks || []).filter(
                            (task) => task?.status === "IN_PROGRESS"
                          )}
                          columns={taskColumns}
                          rowKey={(record) => record?.id || Math.random()}
                          loading={taskLoading}
                          pagination={{ pageSize: 10 }}
                        />
                      </TabPane>
                      <TabPane tab="Completed" key="COMPLETED">
                        <Table
                          dataSource={(userTasks || []).filter(
                            (task) => task?.status === "COMPLETED"
                          )}
                          columns={taskColumns}
                          rowKey={(record) => record?.id || Math.random()}
                          loading={taskLoading}
                          pagination={{ pageSize: 10 }}
                        />
                      </TabPane>
                    </Tabs>
                  </Card>
                ) : (
                  <Card className="select-user-message">
                    <div className="empty-state">
                      <UserOutlined className="large-icon" />
                      <Title level={4}>No User Selected</Title>
                      <Text type="secondary">
                        Please select a user from the list to view their tasks.
                      </Text>
                    </div>
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        )}

        {/* Task Edit Modal */}
        <Modal
          title="Edit Task"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleTaskUpdate}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select a status!" }]}
            >
              <Select>
                {statuses.map((status) => (
                  <Select.Option key={status.id} value={status.id}>
                    {status.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="priority" label="Priority">
              <Select>
                {priorities.map((priority) => (
                  <Select.Option key={priority.name} value={priority.name.toUpperCase()}>
                    {priority.name.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dueDate" label="Due Date">
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update
                </Button>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Create Task Modal */}
        <Modal
          title={`Create Task for ${selectedUser?.name || ""}`}
          open={createTaskModalVisible}
          onCancel={() => setCreateTaskModalVisible(false)}
          footer={null}
        >
          <Form
            form={createTaskForm}
            layout="vertical"
            onFinish={handleCreateTask}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select a status!" }]}
            >
              <Select>
                {statuses.map((status) => (
                  <Select.Option key={status.id} value={status.id}>
                    {status.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="priority" label="Priority">
              <Select>
                {priorities.map((priority) => (
                  <Select.Option key={priority.name} value={priority.name.toUpperCase}>
                    {priority.name.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dueAt" label="Due Date">
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create
                </Button>
                <Button onClick={() => setCreateTaskModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminTaskManagement;
