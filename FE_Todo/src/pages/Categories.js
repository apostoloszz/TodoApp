import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tabs,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import statusService from "../api/statusService";
import priorityService from "../api/priorityService";
import "../styles/Categories.css";

const { TabPane } = Tabs;
const { Option } = Select;

const Categories = () => {
  // Status management
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isPriorityModalVisible, setIsPriorityModalVisible] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingPriority, setEditingPriority] = useState(null);
  const [statusForm] = Form.useForm();
  const [priorityForm] = Form.useForm();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statuses, priorities] = await Promise.all([
          statusService.getAllStatuses(),
          priorityService.getAllPriorities(),
        ]);

        setStatusData(statuses);
        setPriorityData(priorities);
      } catch (error) {
        console.error("Error fetching categories data:", error);
        message.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Status table columns
  const statusColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Task Status",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEditStatus(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => handleDeleteStatus(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Priority table columns
  const priorityColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Task Priority",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEditPriority(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => handleDeletePriority(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Status Handlers
  const handleAddStatus = () => {
    setEditingStatus(null);
    statusForm.resetFields();
    setIsStatusModalVisible(true);
  };

  const handleEditStatus = (status) => {
    setEditingStatus(status);
    statusForm.setFieldsValue({ name: status.name });
    setIsStatusModalVisible(true);
  };

  const handleDeleteStatus = (statusId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this status?",
      content: "This action cannot be undone.",
      onOk: async () => {
        setLoading(true);
        try {
          await statusService.deleteStatus(statusId);
          setStatusData(statusData.filter((item) => item.id !== statusId));
          message.success("Status deleted successfully");
        } catch (error) {
          console.error("Error deleting status:", error);
          message.error("Failed to delete status");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleStatusModalOk = async () => {
    try {
      const values = await statusForm.validateFields();
      setLoading(true);

      if (editingStatus) {
        // Update existing status
        const updatedStatus = await statusService.updateStatus(
          editingStatus.id,
          values
        );
        setStatusData(
          statusData.map((status) =>
            status.id === editingStatus.id ? updatedStatus : status
          )
        );
        message.success("Status updated successfully");
      } else {
        // Add new status
        const newStatus = await statusService.createStatus(values);
        setStatusData([...statusData, newStatus]);
        message.success("Status added successfully");
      }
      setIsStatusModalVisible(false);
    } catch (error) {
      console.error("Error saving status:", error);
      message.error("Failed to save status");
    } finally {
      setLoading(false);
    }
  };

  // Priority Handlers
  const handleAddPriority = () => {
    setEditingPriority(null);
    priorityForm.resetFields();
    setIsPriorityModalVisible(true);
  };

  const handleEditPriority = (priority) => {
    setEditingPriority(priority);
    priorityForm.setFieldsValue({ name: priority.name });
    setIsPriorityModalVisible(true);
  };

  const handleDeletePriority = (priorityId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this priority?",
      content: "This action cannot be undone.",
      onOk: async () => {
        setLoading(true);
        try {
          await priorityService.deletePriority(priorityId);
          setPriorityData(
            priorityData.filter((item) => item.id !== priorityId)
          );
          message.success("Priority deleted successfully");
        } catch (error) {
          console.error("Error deleting priority:", error);
          message.error("Failed to delete priority");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handlePriorityModalOk = async () => {
    try {
      const values = await priorityForm.validateFields();
      setLoading(true);

      if (editingPriority) {
        // Update existing priority
        const updatedPriority = await priorityService.updatePriority(
          editingPriority.id,
          values
        );
        setPriorityData(
          priorityData.map((priority) =>
            priority.id === editingPriority.id ? updatedPriority : priority
          )
        );
        message.success("Priority updated successfully");
      } else {
        // Add new priority
        const newPriority = await priorityService.createPriority(values);
        setPriorityData([...priorityData, newPriority]);
        message.success("Priority added successfully");
      }
      setIsPriorityModalVisible(false);
    } catch (error) {
      console.error("Error saving priority:", error);
      message.error("Failed to save priority");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories-page">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Task Categories" />

        <div className="categories-container">
          <div className="card">
            <Tabs defaultActiveKey="status" className="categories-tabs">
              <TabPane tab="Task Status" key="status">
                <div className="tab-header">
                  <h2>Task Status</h2>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddStatus}
                    className="add-button"
                  >
                    Add Task Status
                  </Button>
                </div>

                <Table
                  columns={statusColumns}
                  dataSource={statusData || []}
                  rowKey="id"
                  pagination={false}
                  loading={loading}
                />
              </TabPane>

              <TabPane tab="Task Priority" key="priority">
                <div className="tab-header">
                  <h2>Task Priority</h2>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddPriority}
                    className="add-button"
                  >
                    Add New Priority
                  </Button>
                </div>

                <Table
                  columns={priorityColumns}
                  dataSource={priorityData || []}
                  rowKey="id"
                  pagination={false}
                  loading={loading}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>

        {/* Status Modal */}
        <Modal
          title={editingStatus ? "Edit Task Status" : "Add New Task Status"}
          open={isStatusModalVisible}
          onOk={handleStatusModalOk}
          onCancel={() => setIsStatusModalVisible(false)}
          confirmLoading={loading}
        >
          <Form form={statusForm} layout="vertical">
            <Form.Item
              name="name"
              label="Status Name"
              rules={[{ required: true, message: "Please enter status name" }]}
            >
              <Input placeholder="Enter status name" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Priority Modal */}
        <Modal
          title={
            editingPriority ? "Edit Task Priority" : "Add New Task Priority"
          }
          open={isPriorityModalVisible}
          onOk={handlePriorityModalOk}
          onCancel={() => setIsPriorityModalVisible(false)}
          confirmLoading={loading}
        >
          <Form form={priorityForm} layout="vertical">
            <Form.Item
              name="name"
              label="Priority Name"
              rules={[
                { required: true, message: "Please enter priority name" },
              ]}
            >
              <Input placeholder="Enter priority name" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Categories;
