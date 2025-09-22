import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Checkbox,
  Input,
  Form,
  Modal,
  message,
  Divider,
  Progress,
  Calendar,
  Typography,
  Tooltip,
  DatePicker,
  Select,
  Badge,
  Tag,
  Space,
  Table,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  SyncOutlined,
  AppstoreOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/PersonalTasks.css";
import axios from "axios";
import dayjs from "dayjs";
import taskService from "../api/taskService";
import adminTaskService from "../api/adminTaskService";
import userService from "../api/userService";
import statusService from "../api/statusService";
import priorityService from "../api/priorityService";
import habitService from "../api/habitService";
import * as categoryService from "../api/categoryService";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PersonalTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser, isAdmin } = useAuth(); // Use AuthContext and isAdmin function

  // Get the active tab from URL parameters or default to "tasks"
  const activeTabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    activeTabFromUrl === "habits" ? "habits" : "tasks"
  );

  // State for tasks and habits
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskForm] = Form.useForm();
  const [habitForm] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Remove currentUser local state since we're using AuthContext
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);

  // Modal states
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [categoryForm] = Form.useForm();

  // Task categories from database
  const [categories, setCategories] = useState([
    { id: "all", key: "all", name: "Tất cả", label: "Tất cả" },
  ]);

  // Fetch all data needed for the page
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Check if currentUser is available
      if (!currentUser) {
        console.log("No current user available");
        setLoading(false);
        return;
      }

      // Fetch all needed data
      let usersData = [];

      // Admin needs to get all users for assignment
      if (isAdmin()) {
        try {
          console.log("Fetching users list as admin");
          usersData = await adminTaskService.getAllUsers();
          console.log("Admin users data:", usersData);
        } catch (error) {
          console.error("Error fetching users as admin:", error);
          // Fallback to standard user service
          usersData = await userService.getAllUsers();
        }
      } else {
        // Regular users only need current user
        usersData = [currentUser];
      }

      // Fetch other data
      const [statusesData, prioritiesData, categoriesData] = await Promise.all([
        statusService.getAllStatuses(),
        priorityService.getAllPriorities(),
        categoryService.getAllCategories(currentUser.id), // Get categories for current user
      ]);

      // Process categories data first
      if (Array.isArray(categoriesData)) {
        // Map the categories and add the 'all' option at the beginning
        const processedCategories = [
          { id: "all", key: "all", name: "Tất cả", label: "Tất cả" },
          ...categoriesData.map((category) => ({
            ...category,
            key: category.id.toString(),
            label: category.name,
          })),
        ];
        setCategories(processedCategories);
        console.log("Fetched categories:", processedCategories);
      } else {
        console.warn("No categories data returned from API or invalid format");
      }

      // Now fetch tasks based on selected category and habits
      const [tasksData, habitsData] = await Promise.all([
        taskService.getMyTasks(
          currentUser.id,
          selectedCategory !== "all" ? selectedCategory : null
        ),
        habitService.getAllHabits(currentUser.id), // Get habits for current user
      ]);

      console.log("Fetched tasks:", tasksData);
      console.log("Fetched habits:", habitsData);

      // Process tasks for current user
      // Since we're already calling getMyTasks with the currentUser.id,
      // we don't need to filter again as the backend should return only user's tasks
      const tasksArray = Array.isArray(tasksData) ? tasksData : [];
      console.log("Processing tasks:", tasksArray);

      // Add sequence numbers to tasks
      setTasks(
        tasksArray.map((task, index) => ({
          ...task,
          sequenceNumber: index + 1,
        }))
      );

      // Process users data to ensure it's an array with consistent structure
      if (usersData) {
        // Make sure it's an array
        const processedUsers = Array.isArray(usersData)
          ? usersData
          : [usersData];

        // Ensure current user is always included
        const currentUserExists = processedUsers.some(
          (user) => user.id === currentUser.id
        );
        if (!currentUserExists && currentUser) {
          processedUsers.unshift(currentUser); // Add current user at the beginning
        }

        console.log("Processed users data:", processedUsers);
        setUsers(processedUsers);
      } else {
        // Fallback to at least include current user
        console.warn(
          "No users data returned, falling back to current user only"
        );
        setUsers(currentUser ? [currentUser] : []);
      }

      setStatuses(statusesData);
      setPriorities(prioritiesData);

      // Process habits data from API
      if (Array.isArray(habitsData)) {
        const processedHabits = habitsData.map((habit) => {
          // Calculate progress based on completedDays vs totalDays
          const completedDaysCount = habit.completedDays?.length || 0;
          const progress = habit.totalDays
            ? Math.round((completedDaysCount / habit.totalDays) * 100)
            : 0;

          return {
            ...habit,
            progress,
          };
        });

        setHabits(processedHabits);
      } else {
        setHabits([]);
        console.warn("No habits data returned from API or invalid format");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error(
        "Failed to fetch data: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update active tab when URL parameters change
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "habits") {
      setActiveTab("habits");
    } else if (tab === "tasks") {
      setActiveTab("tasks");
    }
  }, [searchParams]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
    console.log("Searching for:", value);
  };

  // Get task count by category
  const getTaskCountByCategory = (categoryId) => {
    return tasks.filter((task) =>
      categoryId === "all" ? true : task.category?.id === categoryId
    ).length;
  };

  // Refetch tasks when category changes
  useEffect(() => {
    if (currentUser) {
      // Only refetch tasks, no need to reload everything else
      const fetchTasksForCategory = async () => {
        setLoading(true);
        try {
          console.log(`Fetching tasks for category: ${selectedCategory}`);
          const tasksData = await taskService.getMyTasks(
            currentUser.id,
            selectedCategory !== "all" ? selectedCategory : null
          );

          console.log(
            `Retrieved ${tasksData.length} tasks for category ${selectedCategory}`
          );

          // Add sequence numbers to tasks
          setTasks(
            tasksData.map((task, index) => ({
              ...task,
              sequenceNumber: index + 1,
            }))
          );

          // Reset search query when changing categories
          setSearchQuery("");
        } catch (error) {
          console.error("Error fetching tasks for category:", error);
          message.error("Failed to fetch tasks for the selected category");
        } finally {
          setLoading(false);
        }
      };

      fetchTasksForCategory();
    }
  }, [selectedCategory, currentUser]);

  // Effect to ensure form is populated when modal is visible (similar to Dashboard)
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (isTaskModalVisible && !formInitialized) {
      console.log(
        "Task modal initialization with users:",
        users?.length,
        "isAdmin:",
        isAdmin()
      );

      // For edit mode, make sure the form has the task's values
      if (editingTask) {
        const taskCategoryId = editingTask.category?.id;

        let userIdToUse;
        if (editingTask.user && editingTask.user.id) {
          userIdToUse = editingTask.user.id;
        } else if (editingTask.userId) {
          userIdToUse = editingTask.userId;
        } else {
          userIdToUse = currentUser?.id;
        }

        const formValues = {
          title: editingTask.title,
          description: editingTask.description,
          categoryId: taskCategoryId,
          dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null,
          statusId: editingTask.status,
          priorityId: editingTask.priority,
          userId: userIdToUse, // Always set userId
        };

        console.log("Setting form values for edit:", formValues);
        taskForm.setFieldsValue(formValues);
      }
      // For add mode, make sure current user is selected
      else if (currentUser) {
        // If admin, we can have a default value but still show the dropdown
        const defaultValues = {
          statusId: "PENDING",
          priorityId: "MEDIUM",
          userId: currentUser.id,
        };

        console.log("Setting default values for new task:", defaultValues);
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
    isAdmin,
    users, // Add users as dependency to re-run when users data changes
  ]);

  // Handle task completion toggle
  const handleTaskStatusChange = async (taskId, completed) => {
    try {
      // Use enum values directly as per backend API
      const newStatus = completed ? "COMPLETED" : "PENDING";

      // Find the task to update
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      try {
        // Use the updateTaskStatus method which is specifically for changing status
        const result = await taskService.updateTaskStatus(
          taskId,
          newStatus,
          currentUser.id
        );
        console.log("Task status update result:", result);

        // Update local state immediately
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                }
              : task
          )
        );
      } catch (error) {
        console.error("Error updating task status:", error);
        message.error("Failed to update task status");
        return; // Exit early on error
      }

      message.success(`Task marked as ${completed ? "completed" : "to do"}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    }
  };

  // Handle habit progress update
  const handleHabitProgressUpdate = async (habitId, day, completed) => {
    try {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      let completedDays = [...(habit.completedDays || [])];

      if (completed && !completedDays.includes(day)) {
        completedDays.push(day);
      } else if (!completed) {
        completedDays = completedDays.filter((d) => d !== day);
      }

      // Call API to update habit progress
      await habitService.updateHabitProgress(habitId, completedDays);

      // Also mark today's completion if needed
      if (completed) {
        await habitService.markHabitCompleted(
          habitId,
          dayjs().format("YYYY-MM-DDTHH:mm:ss")
        );
      }

      // Update local state
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completedDays,
                progress: Math.round(
                  (completedDays.length / h.totalDays) * 100
                ),
              }
            : h
        )
      );

      message.success(
        `Habit ${completed ? "completed" : "marked incomplete"} for today`
      );
    } catch (error) {
      console.error("Error updating habit progress:", error);
      message.error("Failed to update habit progress");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      if (!currentUser || !currentUser.id) {
        message.error("User information not found. Please log in again.");
        return;
      }

      try {
        console.log(
          `Attempting to delete task ${taskId} by user ${currentUser.id}`
        );
        await taskService.deleteTask(taskId, currentUser.id);

        // Update local state immediately
        setTasks((prevTasks) => {
          const filteredTasks = prevTasks.filter((task) => task.id !== taskId);
          // Recompute sequence numbers
          return filteredTasks.map((task, idx) => ({
            ...task,
            sequenceNumber: idx + 1,
          }));
        });

        message.success("Task deleted successfully");

        // Refresh in background
        setTimeout(() => {
          fetchAllData();
        }, 500);
      } catch (error) {
        console.error("Error deleting task:", error);
        message.error(
          "Failed to delete task: " + (error.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
    }
  };

  // Delete a habit
  const handleDeleteHabit = async (habitId) => {
    try {
      Modal.confirm({
        title: "Are you sure you want to delete this habit?",
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await habitService.deleteHabit(habitId);

            // Update local state immediately
            setHabits((prevHabits) =>
              prevHabits.filter((habit) => habit.id !== habitId)
            );

            message.success("Habit deleted successfully");

            // Refresh in background
            setTimeout(() => {
              fetchAllData();
            }, 500);
          } catch (error) {
            console.error("Error deleting habit:", error);
            message.error(
              "Failed to delete habit: " + (error.message || "Unknown error")
            );
          }
        },
      });
    } catch (error) {
      console.error("Error deleting habit:", error);
      message.error("Failed to delete habit");
    }
  };

  // Add/edit task modal handlers
  const showAddTaskModal = () => {
    setEditingTask(null);
    taskForm.resetFields();

    // If admin, reload users list to ensure we have fresh data
    if (isAdmin()) {
      adminTaskService
        .getAllUsers()
        .then((usersData) => {
          console.log("Refreshed users for modal:", usersData);
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData);
          }
        })
        .catch((error) => {
          console.error("Error refreshing users for modal:", error);
        });
    }

    setIsTaskModalVisible(true);

    // Automatically set the current user when adding a new task
    // Use setTimeout to ensure the form is rendered before setting values
    setTimeout(() => {
      // Set default values
      const defaultValues = {
        userId: currentUser?.id, // Always default to current user
      };

      // Default category - find a suitable one
      const otherCategory = categories.find(
        (cat) =>
          cat.name?.toLowerCase() === "khác" ||
          cat.name?.toLowerCase() === "other"
      );
      // Use "other" category or first non-"all" category or null
      const defaultCategory =
        otherCategory?.id ||
        (categories.length > 1
          ? categories.find((c) => c.id !== "all")?.id
          : null);

      if (defaultCategory) {
        defaultValues.categoryId = defaultCategory;
      }

      // Default status - use first available or PENDING
      if (statuses.length > 0) {
        const pendingStatus = statuses.find(
          (s) =>
            s.name?.toUpperCase() === "PENDING" ||
            s.name?.toUpperCase() === "TODO" ||
            s.name?.toUpperCase() === "TO DO"
        );
        defaultValues.statusId = pendingStatus?.id || statuses[0].id;
      } else {
        defaultValues.statusId = "PENDING"; // Fallback
      }

      // Default priority - use MEDIUM if available
      if (priorities.length > 0) {
        const mediumPriority = priorities.find(
          (p) =>
            p.name?.toUpperCase() === "MEDIUM" ||
            p.name?.toUpperCase() === "NORMAL"
        );
        defaultValues.priorityId = mediumPriority?.id || priorities[0].id;
      } else {
        defaultValues.priorityId = "MEDIUM"; // Fallback
      }

      taskForm.setFieldsValue(defaultValues);
      console.log("Add task: Default values set", defaultValues);
    }, 100);
  };

  const showEditTaskModal = (task) => {
    setEditingTask(task);

    // If admin, reload users list to ensure we have fresh data
    if (isAdmin()) {
      adminTaskService
        .getAllUsers()
        .then((usersData) => {
          console.log("Refreshed users for edit modal:", usersData);
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData);
          }
        })
        .catch((error) => {
          console.error("Error refreshing users for edit modal:", error);
        });
    }

    setIsTaskModalVisible(true);

    // Use setTimeout to ensure form is rendered before setting values
    setTimeout(() => {
      const taskCategoryId = task.category?.id;

      // Determine the correct user ID to use (following Dashboard.js pattern)
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

      const formValues = {
        title: task.title,
        description: task.description,
        categoryId: taskCategoryId,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        statusId: task.status, // Use enum value directly
        priorityId: task.priority, // Use enum value directly
        userId: userIdToUse, // Always set userId for proper form processing
      };

      console.log("Setting form values for task editing:", formValues);

      taskForm.setFieldsValue(formValues);
      console.log("Form values set:", taskForm.getFieldsValue(true));
    }, 100);
  };

  const handleTaskModalOk = async () => {
    try {
      const values = await taskForm.validateFields();
      console.log("Form values:", values);

      // Format data for the API according to service expectations
      const taskData = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        // Ensure we include both dueDate and dueAt for compatibility
        dueAt: values.dueDate
          ? dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        statusId: values.statusId,
        status: values.statusId, // For admin API compatibility
        priorityId: values.priorityId,
        priority: values.priorityId, // For admin API compatibility
        userId: values.userId || currentUser?.id, // Use selected or current user
      };

      // Log the form values and user assignment
      console.log("Form userId:", values.userId);
      console.log("Current user ID:", currentUser?.id);
      console.log("Is admin:", isAdmin());
      console.log("Task data to send:", taskData);

      // Track if we're assigning to someone else
      const isAssigningToOther =
        values.userId && values.userId !== currentUser?.id;

      if (editingTask) {
        // Update existing task - use admin API if assigning to someone else or is admin
        if (isAdmin() && isAssigningToOther) {
          console.log("Updating task as admin for user:", values.userId);
          const updatedTask = await adminTaskService.updateTaskAsAdmin(
            editingTask.id,
            taskData
          );
          message.success("Task updated successfully as admin");
        } else {
          // Regular update using current user's permissions
          const updatedTask = await taskService.updateTask(
            editingTask.id,
            currentUser.id,
            taskData
          );
          message.success("Task updated successfully");
        }

        // Update the task in local state immediately
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: taskData.title,
                  description: taskData.description,
                  categoryId: taskData.categoryId,
                  category: categories.find(
                    (c) => c.id === taskData.categoryId
                  ),
                  dueDate: taskData.dueAt,
                  status: taskData.statusId,
                  priority: taskData.priorityId,
                  userId: taskData.userId,
                  user: isAssigningToOther
                    ? users.find((u) => u.id === taskData.userId)
                    : task.user,
                }
              : task
          )
        );
      } else {
        // Create new task - use admin API if assigning to someone else
        let newTask;
        if (isAdmin() && isAssigningToOther) {
          console.log("Creating task as admin for user:", values.userId);
          newTask = await adminTaskService.createTaskForUser(
            values.userId,
            taskData
          );
          message.success("Task created successfully as admin");
        } else {
          // Regular creation using current user
          newTask = await taskService.createTask(currentUser.id, taskData);
          message.success("Task created successfully");
        }

        // Add the new task to local state immediately
        if (newTask) {
          const categoryObj = categories.find(
            (c) => c.id === taskData.categoryId
          );
          const userObj = isAssigningToOther
            ? users.find((u) => u.id === taskData.userId)
            : {
                id: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              };

          setTasks((prevTasks) => [
            ...prevTasks,
            {
              ...newTask,
              sequenceNumber: prevTasks.length + 1,
              category: categoryObj,
              user: userObj,
            },
          ]);
        }
      }

      setIsTaskModalVisible(false);
      // Fetch data in background to ensure everything is in sync
      fetchAllData();
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Failed to save task");
    }
  };

  // Add/edit category modal handlers
  const showAddCategoryModal = () => {
    categoryForm.resetFields();
    setIsCategoryModalVisible(true);
  };

  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();

      const categoryData = {
        name: values.name,
        description: values.description || "",
        color: values.color || "#1890ff",
      };

      const newCategory = await categoryService.createCategory(
        currentUser.id,
        categoryData
      );
      message.success("Category created successfully");

      // Update local state immediately
      if (newCategory) {
        setCategories((prevCategories) => [
          ...prevCategories,
          {
            ...newCategory,
            key: newCategory.id.toString(),
            label: newCategory.name,
          },
        ]);
      }

      setIsCategoryModalVisible(false);

      // Fetch data in background to ensure everything is in sync
      fetchAllData();
    } catch (error) {
      console.error("Error creating category:", error);
      message.error("Failed to create category");
    }
  };

  const handleCategoryModalCancel = () => {
    setIsCategoryModalVisible(false);
    categoryForm.resetFields();
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      if (!currentUser || !currentUser.id) {
        message.error("User information not found. Please log in again.");
        return;
      }

      try {
        // Call API to delete category
        await categoryService.deleteCategory(currentUser.id, categoryId);

        // Update local state by removing the deleted category
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat.id !== categoryId)
        );

        // If the deleted category is currently selected, switch to 'all' category
        if (selectedCategory === categoryId) {
          setSelectedCategory("all");
        }

        message.success("Category deleted successfully");

        // Refresh data in background to ensure everything is in sync
        setTimeout(() => {
          fetchAllData();
        }, 500);
      } catch (error) {
        console.error("Error deleting category:", error);
        message.error(
          "Failed to delete category: " + (error.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  // Add/edit habit modal handlers
  const showAddHabitModal = () => {
    setEditingHabit(null);
    habitForm.resetFields();

    // Find the 'other' category or use the first available category
    const otherCategory = categories.find(
      (cat) =>
        cat.name?.toLowerCase() === "khác" ||
        cat.name?.toLowerCase() === "other"
    );
    const defaultCategory =
      otherCategory?.id || (categories.length > 1 ? categories[1].id : null);

    habitForm.setFieldsValue({
      categoryId: defaultCategory,
      totalDays: 30,
    });
    setIsHabitModalVisible(true);
  };

  const showEditHabitModal = (habit) => {
    setEditingHabit(habit);

    // For edit form, use the habit's categoryId or fall back to the category name
    const habitCategoryId =
      habit.categoryId ||
      (habit.category &&
        categories.find(
          (c) => c.name?.toLowerCase() === habit.category?.toLowerCase()
        )?.id);

    habitForm.setFieldsValue({
      title: habit.title,
      description: habit.description,
      categoryId: habitCategoryId,
      totalDays: habit.totalDays || 30,
    });
    setIsHabitModalVisible(true);
  };

  const handleHabitModalOk = async () => {
    try {
      const values = await habitForm.validateFields();

      if (!currentUser) {
        message.error("User information not found. Please log in again.");
        return;
      }

      const habitData = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        totalDays: values.totalDays,
        frequency: values.frequency || "daily",
        userId: currentUser.id,
      };

      if (editingHabit) {
        // Update existing habit using API
        const updatedHabit = await habitService.updateHabit(
          editingHabit.id,
          habitData
        );

        // Update in local state
        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h.id === editingHabit.id
              ? {
                  ...h,
                  ...habitData,
                  completedDays: h.completedDays || [], // Preserve completion data
                  progress: h.progress, // Preserve progress
                }
              : h
          )
        );
        message.success("Habit updated successfully");
      } else {
        // Create new habit using API
        const response = await habitService.createHabit({
          ...habitData,
          completedDays: [],
        });

        // Add to local state
        setHabits((prevHabits) => [
          ...prevHabits,
          {
            ...response, // Use the response from API which should include the ID
            progress: 0,
            completedDays: [],
          },
        ]);
        message.success("Habit created successfully");
      }

      setIsHabitModalVisible(false);

      // Fetch data in background to ensure everything is in sync
      fetchAllData();
    } catch (error) {
      console.error("Error saving habit:", error);
      message.error(
        "Failed to save habit: " + (error.message || "Unknown error")
      );
    }
  };

  // Filter tasks by search query and category
  const filteredTasks = tasks.filter((task) => {
    // Filter by category first (if not "all")
    const categoryMatch =
      selectedCategory === "all" || task.category?.id === selectedCategory;

    // Then filter by search query
    const searchMatch =
      !searchQuery ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Add sequence numbers to filtered tasks
  const tasksWithSequence = filteredTasks.map((task, index) => ({
    ...task,
    sequenceNumber: index + 1,
  }));

  // Get today's date
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  // Format the date for the calendar
  const getMonthData = (value) => {
    if (value.month() === today.getMonth()) {
      return today.getDate();
    }
  };

  const dateCellRender = (value) => {
    const day = value.date();

    // Check if any habits have this day marked as completed
    const hasCompletedHabit = habits.some(
      (habit) => habit.completedDays && habit.completedDays.includes(day)
    );

    return hasCompletedHabit ? <Badge status="success" /> : null;
  };

  return (
    <div className="personal-tasks-page">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Tick to do list`} />
        {/* Task Categories Section */}
        <div className="task-categories-section">
          <div className="categories-header">
            <h2>Task Categories</h2>
            <Button
              type="link"
              onClick={() => navigate("/dashboard")}
              className="go-back-btn"
            >
              Go Back
            </Button>
          </div>

          <div className="categories-grid">
            {/* All Categories card */}
            <div
              className={`category-card ${
                selectedCategory === "all" ? "selected" : ""
              }`}
              onClick={() => setSelectedCategory("all")}
              style={{
                borderColor:
                  selectedCategory === "all" ? "#1890ff" : "transparent",
                boxShadow:
                  selectedCategory === "all" ? "0 0 8px #1890ff" : "none",
                background:
                  selectedCategory === "all"
                    ? "rgba(24, 144, 255, 0.1)"
                    : "transparent",
              }}
            >
              <span className="category-name">
                <AppstoreOutlined style={{ marginRight: 5 }} /> All Tasks
                {selectedCategory === "all" && (
                  <Badge
                    status="processing"
                    color="#1890ff"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
              <span className="category-count">{tasks.length}</span>
            </div>

            {categories
              .filter((cat) => cat.id !== "all")
              .map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${
                    selectedCategory === category.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    borderColor:
                      selectedCategory === category.id
                        ? category.color || "#1890ff"
                        : "transparent",
                    boxShadow:
                      selectedCategory === category.id
                        ? `0 0 8px ${category.color || "#1890ff"}`
                        : "none",
                    background:
                      selectedCategory === category.id
                        ? `linear-gradient(to right, ${
                            category.color || "#1890ff"
                          }22, transparent)`
                        : "transparent",
                  }}
                >
                  <span className="category-name">
                    {category.name}
                    {selectedCategory === category.id && (
                      <Badge
                        status="processing"
                        color={category.color || "#1890ff"}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="category-count">
                      {
                        tasks.filter(
                          (task) => task.category?.id === category.id
                        ).length
                      }
                    </span>
                    <span
                      className="category-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent category selection
                        handleDeleteCategory(category.id);
                      }}
                    >
                      x
                    </span>
                  </div>
                </div>
              ))}
            {/* Add Category Button */}
            <div
              className="category-card add-category"
              onClick={() => setIsCategoryModalVisible(true)}
            >
              <PlusOutlined />
              <span>Thêm</span>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="tabs-section">
          <div className="tab-navigation">
            <Button
              type={activeTab === "tasks" ? "primary" : "default"}
              onClick={() => {
                setActiveTab("tasks");
                navigate("/personal-tasks?tab=tasks", { replace: true });
              }}
              className="tab-button"
            >
              Today
              <PlusOutlined />
            </Button>
            <Button
              type={activeTab === "habits" ? "primary" : "default"}
              onClick={() => {
                setActiveTab("habits");
                navigate("/personal-tasks?tab=habits", { replace: true });
              }}
              className="tab-button"
            >
              Habit tracker
              <PlusOutlined />
            </Button>
          </div>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Loading data..." />
          </div>
        )}{" "}
        <div className="task-container">
          <Card className="task-card">
            <div className="task-header">
              <Title level={4}>My Tasks</Title>
              <div className="task-header-buttons">
                <Search
                  placeholder="Search tasks..."
                  allowClear
                  style={{ width: 200, marginRight: 16 }}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showAddTaskModal}
                >
                  New Task
                </Button>
              </div>
            </div>

            <div className="category-list">
              {categories.map((cat) => (
                <Button
                  key={cat.key || cat.id}
                  className={`category-btn ${
                    selectedCategory === cat.id ? "selected" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === cat.id
                        ? cat.color || "#1890ff"
                        : "transparent",
                    color:
                      selectedCategory === cat.id
                        ? "#fff"
                        : "rgba(0, 0, 0, 0.65)",
                    borderColor: cat.color || "#1890ff",
                    margin: "0 8px 8px 0",
                  }}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    console.log(`Selected category: ${cat.name} (${cat.id})`);
                  }}
                >
                  {cat.id === "all" ? (
                    <>
                      <AppstoreOutlined style={{ marginRight: 5 }} />{" "}
                      {cat.name || cat.label}
                    </>
                  ) : (
                    <>{cat.name || cat.label}</>
                  )}
                  {cat.id !== "all" && (
                    <>
                      <Badge
                        count={
                          tasks.filter((task) => task.category?.id === cat.id)
                            .length
                        }
                        style={{
                          marginLeft: 5,
                          backgroundColor:
                            selectedCategory === cat.id
                              ? "#fff"
                              : cat.color || "#1890ff",
                        }}
                      />
                      <span
                        className="category-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent category selection
                          handleDeleteCategory(cat.id);
                        }}
                      >
                        x
                      </span>
                    </>
                  )}
                </Button>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={showAddCategoryModal}
                style={{ margin: "0 8px 8px 0" }}
              >
                Add Category
              </Button>
            </div>

            <div className="section-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Title level={5} style={{ margin: 0, marginRight: 10 }}>
                  {selectedCategory === "all"
                    ? "All Tasks"
                    : categories.find((c) => c.id === selectedCategory)?.name ||
                      "Tasks"}
                </Title>
                {searchQuery && (
                  <Tag color="blue" closable onClose={() => setSearchQuery("")}>
                    Search: {searchQuery}
                  </Tag>
                )}
                <Badge
                  count={filteredTasks.length}
                  style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
                  title="Number of matching tasks"
                />
              </div>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={showAddTaskModal}
              />
            </div>

            <div className="task-list">
              {tasksWithSequence.length > 0 ? (
                tasksWithSequence.map((task) => (
                  <div key={task.id} className="task-item">
                    <span style={{ minWidth: "25px", color: "#888" }}>
                      {task.sequenceNumber}.
                    </span>
                    <Checkbox
                      checked={task.status === "COMPLETED"}
                      onChange={(e) =>
                        handleTaskStatusChange(task.id, e.target.checked)
                      }
                      disabled={loading}
                    />
                    <div className="task-content">
                      <div
                        className={`task-title ${
                          task.status === "COMPLETED" ? "completed" : ""
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="task-description">{task.description}</div>
                      <Space size={4} style={{ marginTop: "4px" }}>
                        {task.dueDate && (
                          <Tag icon={<CalendarOutlined />} color="blue">
                            {dayjs(task.dueDate).format("YYYY-MM-DD HH:mm:ss")}
                          </Tag>
                        )}
                        {task.priority && (
                          <Tag
                            color={
                              task.priority === "HIGH"
                                ? "red"
                                : task.priority === "MEDIUM"
                                ? "orange"
                                : "green"
                            }
                          >
                            {task.priority.charAt(0) +
                              task.priority.slice(1).toLowerCase()}
                          </Tag>
                        )}
                        {task.category && (
                          <Tag color={task.category.color || "#ccc"}>
                            {task.category.name}
                          </Tag>
                        )}
                        {/* Show assignee info for admin users */}
                        {isAdmin() && task.user && (
                          <Tag color="blue" icon={<UserOutlined />}>
                            {task.user.firstName} {task.user.lastName}
                          </Tag>
                        )}
                      </Space>
                    </div>
                    <div className="task-actions">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => showEditTaskModal(task)}
                      />
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTask(task.id)}
                        danger
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text type="secondary">
                    No tasks found. Create a new task!
                  </Text>
                </div>
              )}
            </div>
          </Card>

          <div className="right-panel">
            <Card className="habit-card">
              <div className="task-header">
                <Title level={4}>My Habits</Title>
                <Space>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={fetchAllData}
                    title="Refresh habits"
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddHabitModal}
                  >
                    New Habit
                  </Button>
                </Space>
              </div>

              <div className="habit-list">
                {habits.length > 0 ? (
                  habits.map((habit, index) => (
                    <div key={habit.id} className="habit-item">
                      <span style={{ minWidth: "25px", color: "#888" }}>
                        {index + 1}.
                      </span>
                      <Checkbox
                        checked={habit.completedDays?.includes(today.getDate())}
                        onChange={(e) =>
                          handleHabitProgressUpdate(
                            habit.id,
                            today.getDate(),
                            e.target.checked
                          )
                        }
                        disabled={loading}
                      />
                      <div className="habit-content">
                        <div className="habit-title">{habit.title}</div>
                        <div className="habit-description">
                          {habit.description}
                        </div>
                        <Progress
                          percent={habit.progress}
                          size="small"
                          status="active"
                          style={{ marginTop: 6 }}
                        />
                      </div>
                      <div className="habit-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => showEditHabitModal(habit)}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteHabit(habit.id)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Text type="secondary">
                      No habits found. Start building habits!
                    </Text>
                  </div>
                )}

                {habits.length > 0 && (
                  <div className="habit-progress">
                    <div className="progress-circle">
                      <Progress
                        type="circle"
                        percent={habits[0].progress}
                        width={120}
                        strokeColor="#1890ff"
                        format={(percent) => (
                          <div className="progress-value">
                            {percent}
                            <span className="percent-symbol">%</span>
                          </div>
                        )}
                      />
                    </div>

                    <div className="habit-calendar">
                      <Calendar
                        fullscreen={false}
                        dateCellRender={dateCellRender}
                        monthCellRender={(value) => {
                          const month = getMonthData(value);
                          return month ? (
                            <div className="notes-month">
                              <section>{month}</section>
                            </div>
                          ) : null;
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        {/* Category Modal */}
        <Modal
          title="Add New Category"
          open={isCategoryModalVisible}
          onOk={handleCategoryModalOk}
          onCancel={handleCategoryModalCancel}
          width={500}
          destroyOnClose={true}
        >
          <Form form={categoryForm} layout="vertical">
            <Form.Item
              name="name"
              label="Category Name"
              rules={[
                { required: true, message: "Please enter category name" },
              ]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Enter category description (optional)"
              />
            </Form.Item>

            <Form.Item name="color" label="Color" initialValue="#1890ff">
              <Input type="color" style={{ width: "100%", height: "40px" }} />
            </Form.Item>
          </Form>
        </Modal>
        {/* Task Modal */}
        <Modal
          title={editingTask ? "Edit Task" : "Add New Task"}
          open={isTaskModalVisible}
          onOk={handleTaskModalOk}
          onCancel={() => setIsTaskModalVisible(false)}
          width={600}
          destroyOnClose={false}
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

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Enter task description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="categoryId" label="Category">                  
                  <Select placeholder="Select category">
                    <Select.Option value={null}>No Category</Select.Option>
                    {categories
                      .filter((c) => c.key !== "all")
                      .map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dueDate" label="Due Date">
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select date and time"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {isAdmin() && (
                <Col span={12}>
                  <Form.Item
                    name="userId"
                    label="Assign To"
                    rules={[
                      { required: true, message: "Please select assignee" },
                    ]}
                  >
                    <Select
                      placeholder="Select assignee"
                      defaultActiveFirstOption={true}
                      onDropdownVisibleChange={(open) => {
                        if (open) {
                          console.log(
                            "Assign To dropdown opened, users:",
                            users
                          );
                        }
                      }}
                    >
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <Option
                            key={user.id}
                            value={user.id}
                            className={
                              currentUser?.id === user.id
                                ? "current-user-option"
                                : ""
                            }
                          >
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username || user.email || "Unknown User"}
                            {currentUser?.id === user.id ? " (You)" : ""}
                          </Option>
                        ))
                      ) : (
                        <Option
                          value={currentUser?.id}
                          className="current-user-option"
                        >
                          {currentUser?.firstName} {currentUser?.lastName} (You)
                        </Option>
                      )}
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
              <Col span={isAdmin() ? 12 : 24}>
                <Form.Item
                  name="statusId"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    {statuses.length > 0 ? (
                      statuses.map((status) => (
                        <Option key={status.id} value={status.id}>
                          {status.name}
                        </Option>
                      ))
                    ) : (
                      <>
                        <Option value="PENDING">Pending</Option>
                        <Option value="IN_PROGRESS">In Progress</Option>
                      </>
                    )}
                    <Option value="COMPLETED">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="priorityId"
              label="Priority"
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select placeholder="Select priority">
                {priorities.length > 0 ? (
                  priorities.map((priority) => (
                    <Option key={priority.id} value={priority.id}>
                      {priority.name}
                    </Option>
                  ))
                ) : (
                  <>
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        {/* Habit Modal */}
        <Modal
          title={editingHabit ? "Edit Habit" : "Add New Habit"}
          open={isHabitModalVisible}
          onOk={handleHabitModalOk}
          onCancel={() => setIsHabitModalVisible(false)}
          width={500}
          destroyOnClose={false}
        >
          <Form form={habitForm} layout="vertical">
            <Form.Item
              name="title"
              label="Habit Title"
              rules={[{ required: true, message: "Please enter habit title" }]}
            >
              <Input placeholder="Enter habit title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Enter habit description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select category" },
                  ]}
                >
                  <Select placeholder="Select category">
                    {categories
                      .filter((c) => c.key !== "all")
                      .map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalDays"
                  label="Target Days"
                  initialValue={30}
                  rules={[
                    { required: true, message: "Please enter target days" },
                  ]}
                >
                  <Input type="number" min={1} placeholder="Number of days" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="frequency" label="Frequency" initialValue="daily">
              <Select placeholder="Select frequency">
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        {/* Add a table view button that would show a table view of tasks */}
        <Modal
          title="Task Table View"
          open={false} // This would be controlled by a state
          onCancel={() => {}} // This would close the modal
          width={900}
          footer={null}
        >
          <Table
            dataSource={tasksWithSequence}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: "STT",
                dataIndex: "sequenceNumber",
                key: "sequenceNumber",
                width: 60,
              },
              {
                title: "Title",
                dataIndex: "title",
                key: "title",
              },
              {
                title: "Status",
                dataIndex: ["status", "name"],
                key: "status",
                render: (status) => (
                  <Tag
                    color={
                      status?.toLowerCase() === "completed"
                        ? "green"
                        : status?.toLowerCase() === "in progress"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {status || "N/A"}
                  </Tag>
                ),
              },
              {
                title: "Priority",
                dataIndex: ["priority", "name"],
                key: "priority",
                render: (priority) => (
                  <Tag
                    color={
                      priority?.toLowerCase() === "high"
                        ? "red"
                        : priority?.toLowerCase() === "medium"
                        ? "orange"
                        : "green"
                    }
                  >
                    {priority || "N/A"}
                  </Tag>
                ),
              },
              {
                title: "Due Date",
                dataIndex: "dueDate",
                key: "dueDate",
                render: (date) =>
                  date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : "N/A",
              },
              {
                title: "Assigned To",
                key: "assignTo",
                render: (_, record) => (
                  <span>
                    {record.assignTo
                      ? `${record.assignTo.firstName || ""} ${
                          record.assignTo.lastName || ""
                        }`
                      : "N/A"}
                  </span>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                width: 120,
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => showEditTaskModal(record)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTask(record.id)}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PersonalTasks;
