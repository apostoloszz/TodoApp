import axiosInstance from "./axiosInstance";

const getAllRoles = async () => {
  try {
    const response = await axiosInstance.get("/api/roles");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getRoleById = async (roleId) => {
  try {
    const response = await axiosInstance.get(`/api/roles/${roleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createRole = async (roleData) => {
  try {
    const response = await axiosInstance.post("/api/roles", roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateRole = async (roleId, roleData) => {
  try {
    const response = await axiosInstance.put(`/api/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteRole = async (roleId) => {
  try {
    await axiosInstance.delete(`/api/roles/${roleId}`);
    return true;
  } catch (error) {
    throw error;
  }
};

const assignRoleToUser = async (userId, roleName) => {
  try {
    const response = await axiosInstance.post(
      `/api/roles/assign?userId=${userId}&roleName=${roleName}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const roleService = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
};

export default roleService;
