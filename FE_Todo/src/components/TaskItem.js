import React from "react";
import { Card, Tag, Button, Tooltip, Avatar } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "../styles/TaskItem.css";
import dayjs from "dayjs";

const TaskItem = ({ task, onEdit, onDelete }) => {
  // Determine color for priority tag
  const getPriorityColor = (priority) => {
    // Handle priority whether it's an object or just a string
    let priorityName = "default";

    if (typeof priority === "object" && priority?.name) {
      priorityName = priority.name.toLowerCase();
    } else if (typeof priority === "string") {
      priorityName = priority.toLowerCase();
    } else if (typeof priority === "number") {
      // If it's just an ID number, we can't determine the color
      return "default";
    }

    switch (priorityName) {
      case "extreme":
      case "high":
        return "red";
      case "moderate":
      case "medium":
        return "blue";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  // Determine color for status tag
  const getStatusColor = (status) => {
    // Handle status whether it's an object or just a string
    let statusName = "default";

    if (typeof status === "object" && status?.name) {
      statusName = status.name.toLowerCase();
    } else if (typeof status === "string") {
      statusName = status.toLowerCase();
    } else if (typeof status === "number") {
      // If it's just an ID number, we can't determine the color
      return "default";
    }

    switch (statusName) {
      case "completed":
      case "done":
        return "success";
      case "in progress":
        return "processing";
      case "not started":
      case "todo":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("MMM D, YYYY");
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false;

    // Don't mark completed tasks as overdue
    if (status) {
      const statusName =
        typeof status === "object" && status.name
          ? status.name.toLowerCase()
          : typeof status === "string"
          ? status.toLowerCase()
          : "";

      if (statusName === "completed" || statusName === "done") {
        return false;
      }
    }

    return dayjs(dueDate).isBefore(dayjs(), "day");
  };

  return (
    <Card className="task-item" bordered={false}>
      <div className="task-header">
        <div
          className="task-status-indicator"
          data-status={(task.status?.name || "")
            .toLowerCase()
            .replace(" ", "-")}
        ></div>
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
              className="edit-button"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(task.id)}
              className="delete-button"
            />
          </Tooltip>
        </div>
      </div>
      <div className="task-content">
        <p className="task-description">{task.description}</p>
        {task.image && (
          <div className="task-image">
            <img src={task.image} alt={task.title} />
          </div>
        )}
      </div>
      <div className="task-footer">
        <div className="task-tags">
          <Tag color={getPriorityColor(task.priority)}>
            Priority:{" "}
            {typeof task.priority === "object"
              ? task.priority?.name || "N/A"
              : task.priority || "N/A"}
          </Tag>
          <Tag color={getStatusColor(task.status)}>
            Status:{" "}
            {typeof task.status === "object"
              ? task.status?.name || "N/A"
              : task.status || "N/A"}
          </Tag>
        </div>
        <div className="task-meta">
          <span className="task-created">
            Created: {formatDate(task.createdAt || task.createdDate)}
          </span>
          <span
            className={`task-due-date ${
              isOverdue(task.dueAt || task.dueDate, task.status)
                ? "task-overdue"
                : ""
            }`}
          >
            {task.dueAt || task.dueDate ? (
              <>
                <CalendarOutlined style={{ marginRight: 3 }} />
                Due: {formatDate(task.dueAt || task.dueDate)}
                {isOverdue(task.dueAt || task.dueDate, task.status) && (
                  <Tag color="error" style={{ marginLeft: 5 }}>
                    <ClockCircleOutlined /> OVERDUE
                  </Tag>
                )}
              </>
            ) : (
              <span className="no-due-date">No due date</span>
            )}
          </span>
          {task.user && (
            <Tooltip title={`Assigned to: ${task.user.username}`}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskItem;
