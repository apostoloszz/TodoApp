import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import roleService from "../api/roleService";
import userService from "../api/userService";

const { Option } = Select;

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Fetch roles and users
  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getAllRoles();
      const usersData = await userService.getAllUsers();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to fetch data. Please try again.");
      setRoles([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Handle role form submission
  const handleRoleFormSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingRole) {
        await roleService.updateRole(editingRole.id, values);
        message.success("Role updated successfully!");
      } else {
        await roleService.createRole(values);
        message.success("Role created successfully!");
      }
      setRoleModalVisible(false);
      roleForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to save role:", error);
      message.error("Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle assign role form submission
  const handleAssignFormSubmit = async (values) => {
    try {
      setLoading(true);
      await roleService.assignRoleToUser(values.userId, values.roleName);
      message.success("Role assigned successfully!");
      setAssignModalVisible(false);
      assignForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to assign role:", error);
      message.error("Failed to assign role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle role edit
  const handleEdit = (role) => {
    setEditingRole(role);
    roleForm.setFieldsValue({
      name: role.name,
    });
    setRoleModalVisible(true);
  };

  // Handle role delete
  const handleDelete = (roleId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this role?",
      onOk: async () => {
        try {
          await roleService.deleteRole(roleId);
          message.success("Role deleted successfully!");
          fetchData();
        } catch (error) {
          console.error("Failed to delete role:", error);
          message.error("Failed to delete role. Please try again.");
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
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
    <div className="roles-page">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Roles Management" />

        <div className="roles-container">
          <div className="card">
            <div className="table-header">
              <h2>Roles</h2>
              <Space>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    assignForm.resetFields();
                    setAssignModalVisible(true);
                  }}
                >
                  Assign Role
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingRole(null);
                    roleForm.resetFields();
                    setRoleModalVisible(true);
                  }}
                >
                  Add Role
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={roles || []}
              rowKey={(record) => record?.id || Math.random()}
              loading={loading}
              bordered
            />
          </div>
        </div>

        {/* Role Form Modal */}
        <Modal
          title={editingRole ? "Edit Role" : "Add Role"}
          open={roleModalVisible}
          onCancel={() => setRoleModalVisible(false)}
          footer={null}
        >
          <Form
            form={roleForm}
            layout="vertical"
            onFinish={handleRoleFormSubmit}
          >
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: "Please input the role name!" },
              ]}
            >
              <Input placeholder="Enter role name" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRole ? "Update" : "Create"}
                </Button>
                <Button onClick={() => setRoleModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Assign Role Modal */}
        <Modal
          title="Assign Role to User"
          open={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          footer={null}
        >
          <Form
            form={assignForm}
            layout="vertical"
            onFinish={handleAssignFormSubmit}
          >
            <Form.Item
              name="userId"
              label="User"
              rules={[{ required: true, message: "Please select a user!" }]}
            >
              <Select placeholder="Select a user">
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.username} ({user.email || "No email"})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="roleName"
              label="Role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select placeholder="Select a role">
                {roles.map((role) => (
                  <Option key={role.id} value={role.name}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Assign
                </Button>
                <Button onClick={() => setAssignModalVisible(false)}>
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

export default Roles;
