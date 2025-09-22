import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Row,
  Col,
  Button,
  Input,
  Modal,
  Form,
  Select,
  message,
  DatePicker,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatusChart from "../components/StatusChart";
import TaskItem from "../components/TaskItem";
import NoteSection from "../components/NoteSection";
import InviteSection from "../components/InviteSection";
import taskService from "../api/taskService";
import adminTaskService from "../api/adminTaskService";
import statusService from "../api/statusService";
import priorityService from "../api/priorityService";
import userService from "../api/userService";
import * as categoryService from "../api/categoryService";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { currentUser: authUser, isAdmin } = useAuth(); // Get user and role from auth context
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryField, setShowCategoryField] = useState(false);

  // Helper functions to get names by ID
  const getStatusNameById = (statusId, statusList) => {
    if (!statusList || !statusId) return "Unknown";
    const status = statusList.find((s) => s.id === statusId);
    return status ? status.name : "Unknown";
  };

  const getPriorityNameById = (priorityId, priorityList) => {
    if (!priorityList || !priorityId) return "Unknown";
    const priority = priorityList.find((p) => p.id === priorityId);
    return priority ? priority.name : "Unknown";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return; // Don't fetch if no authenticated user

      setLoading(true);
      try {
        // Use current user from auth context
        setCurrentUser(authUser);

        // Choose API service based on user role
        let tasksData;
        try {
          if (isAdmin()) {
            // Admin can see all tasks from all users
            console.log("Fetching all tasks for ADMIN role");
            tasksData = await taskService.getAllTasks();
          } else if (authUser && authUser.id) {
            // Regular user sees only their own tasks
            console.log("Fetching tasks for USER role with ID:", authUser.id);
            tasksData = await taskService.getMyTasks(authUser.id);
          } else {
            console.error("No user ID available for task fetching");
            tasksData = [];
          }
          console.log("Tasks fetched:", tasksData ? tasksData.length : 0);
        } catch (error) {
          console.error("Error fetching tasks:", error);
          tasksData = [];
        }

        // Fetch other required data
        const [statusesData, prioritiesData, usersData, categoriesData] =
          await Promise.all([
            statusService.getAllStatuses(),
            priorityService.getAllPriorities(),
            isAdmin() ? userService.getAllUsers() : Promise.resolve([authUser]), // Admin sees all users, regular user sees only themselves
            categoryService.getAllCategories(authUser.id), // Load categories for current user
          ]);

        console.log("Fetched tasks:", tasksData);
        console.log("Fetched statuses:", statusesData);
        console.log("Fetched priorities:", prioritiesData);
        console.log("User role - isAdmin:", isAdmin());

        // Normalize tasks to ensure consistent structure
        // Make sure tasksData is an array before mapping
        const tasksArray = Array.isArray(tasksData) ? tasksData : [];
        console.log("Raw tasksData:", tasksData);

        if (!Array.isArray(tasksData)) {
          console.error("tasksData is not an array:", tasksData);
        }

        const normalizedTasks = tasksArray
          .map((task) => {
            // Handle null task values gracefully
            if (!task) {
              console.warn("Found null task in tasksData");
              return null;
            }

            // Get status object or create one
            let statusObj;
            if (typeof task.status === "object" && task.status) {
              statusObj = task.status;
            } else if (task.status) {
              statusObj = {
                id: task.status,
                name: getStatusNameById(task.status, statusesData),
              };
            } else {
              // Default status if none provided
              statusObj = { id: null, name: "PENDING" };
            }

            // Get priority object or create one
            let priorityObj;
            if (typeof task.priority === "object" && task.priority) {
              priorityObj = task.priority;
            } else if (task.priority) {
              priorityObj = {
                id: task.priority,
                name: getPriorityNameById(task.priority, prioritiesData),
              };
            } else {
              // Default priority if none provided
              priorityObj = { id: null, name: "MEDIUM" };
            }

            return {
              ...task,
              status: statusObj,
              priority: priorityObj,
            };
          })
          .filter(Boolean); // Filter out null tasks        // Log raw task data to inspect status values
        console.log(
          "Raw task data with status values:",
          normalizedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            statusType: typeof t.status,
            statusName: t.status?.name,
          }))
        );

        // Process tasks
        const completedTasksList = normalizedTasks.filter((task) => {
          const statusName = task.status?.name?.toUpperCase();
          return statusName === "COMPLETED" || statusName === "DONE";
        });
        const activeTasksList = normalizedTasks.filter((task) => {
          const statusName = task.status?.name?.toUpperCase();
          return statusName !== "COMPLETED" && statusName !== "DONE";
        });

        setTasks(activeTasksList);
        setCompletedTasks(completedTasksList);

        // Set options for dropdowns
        setStatusOptions(statusesData);
        setPriorityOptions(prioritiesData);
        setUserOptions(usersData);
        setCategories(categoriesData);

        // Prepare chart data with better initialization
        const taskCounts = {};

        // First, initialize all possible status names to ensure complete data
        statusesData.forEach((status) => {
          // Use both the original name and uppercase version for better matching
          taskCounts[status.name] = 0;
          if (status.name !== status.name.toUpperCase()) {
            taskCounts[status.name.toUpperCase()] = 0;
          }
        });

        // Additional explicit handling of common status names
        const commonStatuses = [
          "Completed",
          "In Progress",
          "Pending",
          "Not Started",
        ];
        commonStatuses.forEach((status) => {
          if (taskCounts[status] === undefined) {
            taskCounts[status] = 0;
          }
        });

        // Count tasks by status using normalized data
        normalizedTasks.forEach((task) => {
          // Try different formats to ensure we count properly
          const statusName = task.status.name;

          if (taskCounts[statusName] !== undefined) {
            taskCounts[statusName]++;
          } else if (statusName.includes("_")) {
            // Try with spaces instead of underscores
            const altName = statusName.replace(/_/g, " ");
            if (taskCounts[altName] !== undefined) {
              taskCounts[altName]++;
            }
          } else {
            // Try uppercase with underscores
            const altName = statusName.toUpperCase().replace(/ /g, "_");
            if (taskCounts[altName] !== undefined) {
              taskCounts[altName]++;
            }
          }
        });

        const chartDataArray = Object.entries(taskCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setChartData(chartDataArray);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we have authUser
    if (authUser) {
      fetchData();
    }
  }, [authUser, isAdmin]); // Re-run when authUser or role changes

  // Task Modal
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [editingTask, setEditingTask] = useState(null);
  const [formInitialized, setFormInitialized] = useState(false);

  // Function to refresh all data
  const refreshAllData = async () => {
    if (!authUser) return; // Don't fetch if no authenticated user

    setLoading(true);
    try {
      console.log("Refreshing all data...");

      // Choose API service based on user role
      let tasksData;
      try {
        if (isAdmin()) {
          // Admin can see all tasks from all users
          console.log("Refreshing - Fetching all tasks for ADMIN role");
          tasksData = await taskService.getAllTasks();
        } else if (authUser && authUser.id) {
          // Regular user sees only their own tasks
          console.log(
            "Refreshing - Fetching tasks for USER role with ID:",
            authUser.id
          );
          tasksData = await taskService.getMyTasks(authUser.id);
        } else {
          console.error("Refreshing - No user ID available for task fetching");
          tasksData = [];
        }
        console.log(
          "Refreshing - Tasks fetched:",
          tasksData ? tasksData.length : 0
        );
      } catch (error) {
        console.error("Refreshing - Error fetching tasks:", error);
        tasksData = [];
      }

      // Fetch other required data
      const [statusesData, prioritiesData, usersData, categoriesData] =
        await Promise.all([
          statusService.getAllStatuses(),
          priorityService.getAllPriorities(),
          isAdmin() ? userService.getAllUsers() : Promise.resolve([authUser]), // Admin sees all users, regular user sees only themselves
          categoryService.getAllCategories(authUser.id), // Load categories for current user
        ]);

      console.log("Fetched fresh tasks data:", tasksData);
      console.log("Fetched fresh statuses data:", statusesData);
      console.log("User role - isAdmin:", isAdmin());

      // Update current user from auth context
      if (authUser && !currentUser) {
        setCurrentUser(authUser);
      }

      // Make sure tasksData is an array before mapping
      const tasksArray = Array.isArray(tasksData) ? tasksData : [];
      console.log("refreshAllData - Raw tasksData:", tasksData);

      if (!Array.isArray(tasksData)) {
        console.error("refreshAllData - tasksData is not an array:", tasksData);
      }

      // Normalize tasks to ensure consistent structure
      const normalizedTasks = tasksArray.map((task) => {
        // Enhanced normalization for status
        let statusObj = task.status;
        if (typeof task.status !== "object" || task.status === null) {
          // Handle both ID (number) and name (string) formats
          if (typeof task.status === "number") {
            statusObj = {
              id: task.status,
              name: getStatusNameById(task.status, statusesData),
            };
          } else if (typeof task.status === "string") {
            // Try to find status ID from name
            const matchedStatus = statusesData.find(
              (s) =>
                s.name === task.status ||
                s.name.toUpperCase() === task.status.toUpperCase()
            );
            statusObj = {
              id: matchedStatus ? matchedStatus.id : null,
              name: task.status,
            };
          } else {
            // Default case - unknown status
            statusObj = { id: null, name: "Unknown" };
          }
        }

        // Enhanced normalization for priority
        let priorityObj = task.priority;
        if (typeof task.priority !== "object" || task.priority === null) {
          // Handle both ID (number) and name (string) formats
          if (typeof task.priority === "number") {
            priorityObj = {
              id: task.priority,
              name: getPriorityNameById(task.priority, prioritiesData),
            };
          } else if (typeof task.priority === "string") {
            // Try to find priority ID from name
            const matchedPriority = prioritiesData.find(
              (p) =>
                p.name === task.priority ||
                p.name.toUpperCase() === task.priority.toUpperCase()
            );
            priorityObj = {
              id: matchedPriority ? matchedPriority.id : null,
              name: task.priority,
            };
          } else {
            // Default case - unknown priority
            priorityObj = { id: null, name: "Unknown" };
          }
        }

        return {
          ...task,
          status: statusObj,
          priority: priorityObj,
        };
      });

      console.log("Normalized tasks:", normalizedTasks);

      // Log statuses before filtering
      console.log(
        "Task statuses before filtering:",
        normalizedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          statusName: t.status?.name,
        }))
      );

      // Enhanced status matching for task filtering
      const completedTasksList = normalizedTasks.filter((task) => {
        const statusName = (task.status?.name || "").toLowerCase();
        return (
          statusName.includes("complete") ||
          statusName.includes("completed") ||
          statusName.includes("done") ||
          statusName === "done" ||
          statusName === "completed"
        );
      });

      const activeTasksList = normalizedTasks.filter((task) => {
        const statusName = (task.status?.name || "").toLowerCase();
        return (
          !statusName.includes("complete") &&
          !statusName.includes("completed") &&
          !statusName.includes("done") &&
          statusName !== "done" &&
          statusName !== "completed"
        );
      });

      // Log split tasks
      console.log("Active tasks:", activeTasksList.length);
      console.log("Completed tasks:", completedTasksList.length);

      setTasks(activeTasksList);
      setCompletedTasks(completedTasksList);
      setStatusOptions(statusesData);
      setPriorityOptions(prioritiesData);
      setUserOptions(usersData);
      setCategories(categoriesData);

      // Update chart data
      updateChartData(normalizedTasks, statusesData);

      message.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    taskForm.resetFields();
    setIsTaskModalVisible(true);

    // For regular users, always show category field
    // For admin, initially show category field since task is for self by default
    setShowCategoryField(!isAdmin() || true);

    // Automatically set the current user and default values when adding a new task
    // Use setTimeout to ensure the form is rendered before setting values
    setTimeout(() => {
      if (currentUser) {
        const defaultValues = {
          userId: currentUser.id,
        };

        // Set default priority and status for new tasks
        if (priorityOptions.length > 0) {
          defaultValues.priority = priorityOptions[0].id;
        }
        if (statusOptions.length > 0) {
          defaultValues.status = statusOptions[0].id;
        }

        taskForm.setFieldsValue(defaultValues);
        console.log("Add task: Set default values", defaultValues);
      }
    }, 100);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    // Handle priority whether it's an object or just an ID, with fallback
    let priorityValue;
    if (typeof task.priority === "object" && task.priority?.id) {
      priorityValue = task.priority.id;
    } else if (task.priority) {
      priorityValue = task.priority;
    } else {
      // Default priority if none exists - use MEDIUM priority or first available
      const mediumPriority = priorityOptions.find(
        (p) => p.name === "MEDIUM" || p.name === "Medium"
      );
      priorityValue = mediumPriority
        ? mediumPriority.id
        : priorityOptions.length > 0
        ? priorityOptions[0].id
        : null;
    }

    // Handle status with fallback
    let statusValue;
    if (typeof task.status === "object" && task.status?.id) {
      statusValue = task.status.id;
    } else if (task.status) {
      statusValue = task.status;
    } else {
      // Default status if none exists - use PENDING status or first available
      const pendingStatus = statusOptions.find(
        (s) => s.name === "PENDING" || s.name === "Pending"
      );
      statusValue = pendingStatus
        ? pendingStatus.id
        : statusOptions.length > 0
        ? statusOptions[0].id
        : null;
    }

    // Determine the correct user ID to use
    let userIdToUse;
    if (task.user && task.user.id) {
      // If task has user info in object form
      userIdToUse = task.user.id;
    } else if (task.userId) {
      // If task has direct userId
      userIdToUse = task.userId;
    } else {
      // Fallback to current user
      userIdToUse = currentUser?.id;
    }

    // Set showCategoryField based on whether task is assigned to current user
    const shouldShowCategory = !isAdmin() || userIdToUse === currentUser?.id;
    setShowCategoryField(shouldShowCategory);

    // Handle category ID with better logging
    let categoryId = null;
    if (task.category && task.category.id) {
      categoryId = task.category.id;
      console.log("Category found in task.category:", categoryId);
    } else if (task.categoryId) {
      categoryId = task.categoryId;
      console.log("Category found in task.categoryId:", categoryId);
    }

    // Log the found values for debugging
    console.log("Task edit values:", {
      taskId: task.id,
      title: task.title,
      status: statusValue,
      priority: priorityValue,
      userId: userIdToUse,
      categoryId: categoryId,
      dueDate: task.dueDate || task.dueAt,
    });

    // Wait a moment for form to be ready
    setTimeout(() => {
      taskForm.setFieldsValue({
        title: task.title,
        description: task.description,
        status: statusValue,
        priority: priorityValue,
        userId: userIdToUse,
        categoryId: categoryId,
        dueAt: task.dueAt
          ? dayjs(task.dueAt)
          : task.dueDate
          ? dayjs(task.dueDate)
          : null,
      });

      console.log("Form values set:", taskForm.getFieldsValue(true));
    }, 100);

    setIsTaskModalVisible(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);

      if (isAdmin()) {
        await adminTaskService.deleteTaskAsAdmin(taskId);
      } else {
        // Pass the currentUser.id as the second parameter to fix the 403 error
        await taskService.deleteTask(taskId, currentUser.id);
      }

      message.success("Task deleted successfully");

      // Use the comprehensive refreshAllData function to ensure data consistency
      await refreshAllData();
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
      setLoading(false); // Make sure to reset loading state if there's an error
    }
  };

  const updateChartData = (tasksData, statuses) => {
    // Early exit if no valid data provided
    if (!Array.isArray(tasksData) || !Array.isArray(statuses)) {
      console.warn("Invalid data for updateChartData:", {
        tasksData,
        statuses,
      });
      return;
    }

    try {
      const taskCounts = {};

      // Initialize all possible status names
      statuses.forEach((status) => {
        if (status && status.name) {
          taskCounts[status.name] = 0;
          // Add uppercase version for better matching
          if (status.name !== status.name.toUpperCase()) {
            taskCounts[status.name.toUpperCase()] = 0;
          }
          // Add version with spaces instead of underscores
          if (status.name.includes("_")) {
            taskCounts[status.name.replace(/_/g, " ")] = 0;
          }
        }
      });

      // Add common status names explicitly
      const commonStatuses = [
        "Completed",
        "In Progress",
        "Pending",
        "Not Started",
        "Todo",
      ];
      commonStatuses.forEach((status) => {
        if (taskCounts[status] === undefined) {
          taskCounts[status] = 0;
        }
      });

      // Normalize task status before counting
      tasksData.forEach((task) => {
        if (!task) return; // Skip null/undefined tasks

        let statusName;

        if (typeof task.status === "object" && task.status !== null) {
          statusName = task.status.name;
        } else if (typeof task.status === "string") {
          statusName = task.status;
        } else if (typeof task.status === "number") {
          statusName = getStatusNameById(task.status, statuses);
        }

        // Try different formats to ensure proper counting
        if (statusName && taskCounts[statusName] !== undefined) {
          taskCounts[statusName]++;
        } else if (statusName && statusName.includes("_")) {
          // Try with spaces instead of underscores
          const altName = statusName.replace(/_/g, " ");
          if (taskCounts[altName] !== undefined) {
            taskCounts[altName]++;
          }
        } else if (statusName) {
          // Try uppercase with underscores
          const altName = statusName.toUpperCase().replace(/ /g, "_");
          if (taskCounts[altName] !== undefined) {
            taskCounts[altName]++;
          }
        }
      });

      // Filter out any entries with zero values and empty names
      const chartDataArray = Object.entries(taskCounts)
        .filter(
          ([name, value]) => name && name.trim() !== "" && value !== undefined
        )
        // Sort by value (count) descending
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({
          name,
          value,
        }));

      // Compare with previous chart data to avoid unnecessary re-renders
      const currentDataStr = JSON.stringify(chartData);
      const newDataStr = JSON.stringify(chartDataArray);

      if (currentDataStr !== newDataStr) {
        console.log("Updated chart data:", chartDataArray);
        setChartData(chartDataArray);
      } else {
        console.log("Chart data unchanged, skipping update");
      }
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  };

  // Effect to ensure form is populated when modal is visible
  useEffect(() => {
    if (isTaskModalVisible && !formInitialized) {
      // For edit mode, make sure the form has the task's values
      if (editingTask) {
        // Handle priority with fallback
        let priorityValue;
        if (
          typeof editingTask.priority === "object" &&
          editingTask.priority?.id
        ) {
          priorityValue = editingTask.priority.id;
        } else if (editingTask.priority) {
          priorityValue = editingTask.priority;
        } else {
          // Default priority if none exists
          priorityValue =
            priorityOptions.length > 0 ? priorityOptions[0].id : null;
        }

        // Handle status with fallback
        let statusValue;
        if (typeof editingTask.status === "object" && editingTask.status?.id) {
          statusValue = editingTask.status.id;
        } else if (editingTask.status) {
          statusValue = editingTask.status;
        } else {
          // Default status if none exists
          statusValue = statusOptions.length > 0 ? statusOptions[0].id : null;
        }

        const userIdToUse =
          editingTask.user?.id || editingTask.userId || currentUser?.id;

        taskForm.setFieldsValue({
          title: editingTask.title,
          description: editingTask.description,
          status: statusValue,
          priority: priorityValue,
          userId: userIdToUse,
          categoryId:
            editingTask.category?.id || editingTask.categoryId || null,
          dueAt: editingTask.dueAt
            ? dayjs(editingTask.dueAt)
            : editingTask.dueDate
            ? dayjs(editingTask.dueDate)
            : null,
        });
      }
      // For add mode, make sure current user is selected and set default values
      else if (currentUser) {
        const defaultValues = {
          userId: currentUser.id,
        };

        // Set default priority and status for new tasks
        if (priorityOptions.length > 0) {
          defaultValues.priority = priorityOptions[0].id;
        }
        if (statusOptions.length > 0) {
          defaultValues.status = statusOptions[0].id;
        }

        taskForm.setFieldsValue(defaultValues);
      }

      setFormInitialized(true);
      console.log(
        "Form initialized with values:",
        taskForm.getFieldsValue(true)
      );
    }

    // Reset initialization flag when modal closes
    if (!isTaskModalVisible) {
      setFormInitialized(false);
    }
  }, [
    isTaskModalVisible,
    editingTask,
    currentUser,
    formInitialized,
    taskForm,
    priorityOptions,
    statusOptions,
  ]);

  const handleTaskModalOk = async () => {
    try {
      setLoading(true);
      const values = await taskForm.validateFields();

      console.log("Form values:", values);

      // Ensure required fields have values
      if (!values.priority && priorityOptions.length > 0) {
        values.priority = priorityOptions[0].id;
      }
      if (!values.status && statusOptions.length > 0) {
        values.status = statusOptions[0].id;
      }

      // Prepare task data for API based on role
      // Handle date conversion with proper timezone preservation
      let formattedDueDate = null;
      if (values.dueAt) {
        // Create a formatted date string that preserves the local time
        // Format as ISO string but keep the local time by using format instead of toISOString
        formattedDueDate = values.dueAt.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }

      const taskData = isAdmin()
        ? {
            // Format for admin API endpoints
            title: values.title,
            description: values.description,
            status: values.status, // Admin API expects the enum value directly
            priority: values.priority, // Admin API expects the enum value directly
            dueDate: formattedDueDate,
            // Handle both ways to assign a user - either directly or as a nested object
            userId: values.userId || currentUser?.id, // Direct ID for some APIs
            user: { id: values.userId || currentUser?.id }, // Nested object for other APIs
            // Handle both ways to assign a category
            categoryId: values.categoryId || null, // Direct ID for some APIs
            category: values.categoryId ? { id: values.categoryId } : null, // Nested object for other APIs
          }
        : {
            // Format for regular user API endpoints
            title: values.title,
            description: values.description,
            statusId: values.status,
            priorityId: values.priority,
            // Handle both ways to assign a category
            categoryId: values.categoryId || null,
            category: values.categoryId ? { id: values.categoryId } : null,
            // Include both date formats for compatibility with consistent formatting
            dueAt: formattedDueDate,
            dueDate: formattedDueDate,
            // User ID - for regular users it should always be their own ID
            userId: currentUser?.id,
            user: { id: currentUser?.id },
          };

      // Validate required fields before sending to API
      if (isAdmin()) {
        if (!taskData.status || !taskData.priority) {
          message.error("Status and Priority are required");
          setLoading(false);
          return;
        }
      } else {
        if (!taskData.statusId || !taskData.priorityId) {
          message.error("Status and Priority are required");
          setLoading(false);
          return;
        }
      }

      console.log("Task data to send:", taskData);

      let updatedTask;

      if (editingTask) {
        // Update existing task - make sure ID is included in the payload as well
        const taskDataWithId = {
          ...taskData,
          id: editingTask.id, // Ensure ID is included for proper updating
        };

        // Log the final data being sent
        console.log("Update task: sending data with ID:", taskDataWithId);

        if (isAdmin()) {
          // Admin API update with correct format
          updatedTask = await adminTaskService.updateTaskAsAdmin(
            editingTask.id,
            taskDataWithId
          );
        } else {
          // Regular user update
          updatedTask = await taskService.updateGeneralTask(
            editingTask.id,
            taskDataWithId
          );
        }

        const dueInfo = values.dueAt
          ? ` (Due: ${values.dueAt.format("YYYY-MM-DD HH:mm")})`
          : "";
        message.success(`Task updated successfully${dueInfo}`);
      } else {
        // Add new task
        if (isAdmin()) {
          // Admin can create task for any user
          const targetUserId = values.userId || currentUser?.id;

          // Make sure the task data has the right user ID format and dueDate is properly set
          const taskDataWithTargetUser = {
            ...taskData,
            userId: targetUserId,
            user: { id: targetUserId },
            // dueDate is already set properly in taskData
          };

          console.log(
            "Admin creating task for user:",
            targetUserId,
            taskDataWithTargetUser
          );

          updatedTask = await adminTaskService.createTaskForUser(
            targetUserId,
            taskDataWithTargetUser
          );
        } else {
          // Regular user creates task for themselves
          console.log("User creating task for self:", taskData);
          updatedTask = await taskService.createGeneralTask(taskData);
        }

        const dueInfo = values.dueAt
          ? ` (Due: ${values.dueAt.format("YYYY-MM-DD HH:mm")})`
          : "";
        message.success(`Task created successfully${dueInfo}`);
      }

      console.log("Task after save:", updatedTask);

      setIsTaskModalVisible(false);

      // Use the comprehensive refreshAllData function to ensure data consistency
      await refreshAllData();
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Failed to save task");
      setLoading(false); // Make sure to reset loading state if there's an error
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Welcome back, Thùy Dương 👋" />

        <div className="dashboard-content">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div className="task-section">
                <div className="section-header">
                  <div className="section-title">
                    <span className="icon">📝</span>
                    <h2>To-Do</h2>
                  </div>
                  <div className="section-actions">
                    <Button
                      onClick={refreshAllData}
                      style={{ marginRight: "8px" }}
                      loading={loading}
                    >
                      Refresh
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddTask}
                    >
                      Add task
                    </Button>
                  </div>
                </div>
                <div
                  className={`task-list ${
                    loading ? "loading-fade" : "loaded-fade"
                  }`}
                >
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <div className="loading-text">Synchronizing tasks...</div>
                    </div>
                  ) : tasks.length > 0 ? (
                    tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="task-item-wrapper"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animation: "slideIn 0.3s ease-out forwards",
                        }}
                      >
                        <TaskItem
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="no-tasks">No active tasks found</div>
                  )}
                </div>

                <div className="section-header completed-header">
                  <div className="section-title">
                    <h2>Task Analytics</h2>
                  </div>
                </div>
                <div className="status-charts">
                  <StatusChart data={chartData} />
                </div>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className="sidebar-content">
                <div className="completed-tasks-section">
                  <div className="section-header">
                    <div className="section-title">
                      <h2>Completed Task</h2>
                    </div>
                  </div>
                  <div
                    className={`completed-task-list ${
                      loading ? "loading-fade" : "loaded-fade"
                    }`}
                  >
                    {loading ? (
                      <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">
                          Synchronizing tasks...
                        </div>
                      </div>
                    ) : completedTasks.length > 0 ? (
                      completedTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="task-item-wrapper"
                          style={{
                            animationDelay: `${index * 0.05}s`,
                            animation: "slideIn 0.3s ease-out forwards",
                          }}
                        >
                          <TaskItem
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="no-tasks">No completed tasks</div>
                    )}
                  </div>
                </div>

                <NoteSection />

                <InviteSection />
              </div>
            </Col>
          </Row>
        </div>

        {/* Task Modal */}
        <Modal
          title={editingTask ? "Edit Task" : "Add New Task"}
          open={isTaskModalVisible}
          onOk={handleTaskModalOk}
          onCancel={() => {
            // Don't reset the form when just closing the modal
            setIsTaskModalVisible(false);
          }}
          width={600}
          destroyOnClose={false} // Important: This preserves form state
          confirmLoading={loading}
        >
          <Form form={taskForm} layout="vertical">
            <Form.Item
              name="title"
              label="Task Title"
              rules={[{ required: true, message: "Please enter task title" }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter task description" },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter task description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    {statusOptions.map((status) => (
                      <Select.Option key={status.id} value={status.id}>
                        {status.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="priority"
                  label="Priority"
                  rules={[
                    { required: true, message: "Please select priority" },
                  ]}
                >
                  <Select placeholder="Select priority">
                    {priorityOptions.map((priority) => (
                      <Select.Option key={priority.id} value={priority.id}>
                        {priority.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Only show Assign To field for admins, but always include userId in form for processing */}
              {isAdmin() && (
                <Col span={8}>
                  <Form.Item
                    name="userId"
                    label="Assign To"
                    rules={[{ required: true, message: "Please select user" }]}
                  >
                    <Select
                      placeholder="Select user"
                      defaultActiveFirstOption={true}
                      onChange={(value) => {
                        // Show category field only when admin selects themselves
                        setShowCategoryField(value === currentUser?.id);
                      }}
                    >
                      {userOptions.map((user) => (
                        <Select.Option
                          key={user.id}
                          value={user.id}
                          className={
                            currentUser?.id === user.id
                              ? "current-user-option"
                              : ""
                          }
                        >
                          {user.username}
                          {currentUser?.id === user.id ? " (You)" : ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {/* Hidden field for non-admin users to store current user ID */}
              {!isAdmin() && (
                <Form.Item name="userId" hidden>
                  <Input />
                </Form.Item>
              )}

              {/* Show Category field for regular users or when admin selects themselves */}
              {(!isAdmin() || showCategoryField) && (
                <Col span={isAdmin() ? 8 : 8}>
                  <Form.Item name="categoryId" label="Category">
                    <Select
                      placeholder="Select category"
                      allowClear
                      onChange={(value) =>
                        console.log("Category selected:", value)
                      }
                    >
                      <Select.Option value={null}>No Category</Select.Option>
                      {categories.map((category) => (
                        <Select.Option key={category.id} value={category.id}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Form.Item name="dueAt" label="Due Date">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
                placeholder="Select due date and time"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
