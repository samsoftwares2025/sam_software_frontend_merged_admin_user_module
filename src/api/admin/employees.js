// src/api/admin/employee.js
import http from "../http";

const getUserId = () => {
  return localStorage.getItem("userId");
};


/**
 * getEmployeeMasterData
 * (Same auth pattern as departments)
 */
export const getEmployeeMasterData = async (payload = {}) => {
  const userId = localStorage.getItem("userId");

  const { data } = await http.post(
    "/hr/list-employee-master-data/",
    {
      user_id: userId,
      page: payload.page,
      page_size: payload.page_size,
    }
  );

  return data;
};


// src/api/admin/employees.js
export const filterEmployeeMasterData = async (payload) => {
  const userId = localStorage.getItem("userId");

  const { data } = await http.post(
    "/hr/filter-employee-master-data/",
    {
      user_id: userId,
      search: payload?.search || "",
      department_name: payload?.department || "",
      is_active: payload?.is_active || "",   
      page: payload?.page || 1,
      page_size: payload?.page_size || 20,
    }
  );

  return data;
};


/**
 * getEmployeeHistoryData
 */
export const getEmployeeHistoryData = async () => {

  const userId = localStorage.getItem("userId");

  const { data } = await http.post(
    "/hr/list-employee-master-data/",
    { user_id: userId }
  );

  return data;
};



export const filterEmployeeHistoryData = async (payload) => {
  const userId = localStorage.getItem("userId");

  const { data } = await http.post(
    "/hr/filter-employee-master-data/",
    {
      user_id: userId,
      search: payload?.search || "",
      is_active: payload?.is_active || "", 
      page: payload?.page || 1,
      page_size: payload?.page_size || 20,
      page_size: payload?.page_size || 20,

    }
  );

  return data;
};






/**
 * getEmployeeDocuments
 */

export const getEmployeeDocuments = async ({ page = 1, page_size = 20 }) => {
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post(
    "/hr/list-employee-documents/",
    {
      user_id: userId,
      page,
      page_size,
    }
  );

  return data;
};



export const filterEmployeeDocuments = async (payload) => {
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post(
    "/hr/filter-employee-documents/",
    {
      user_id: userId,
      search: payload?.search || "",
      status: payload?.status || "",
      department_id: payload?.department_id || "",
      country: payload?.country || "",
      page: payload?.page || 1,
      page_size: payload?.page_size || 20,
    }
  );

  return data;
};









/**
 * createEmployee
 */
export const createEmploye = async (formData) => {
  const { data } = await http.post(
    "/hr/add-employee/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};



// src/api/admin/employees.js
export const getEmployeesList = async () => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post("/hr/list-employee-master-data/", {
    user_id: userId,
    page: 1,
    page_size: 500, // enough for dropdown
  });

  return data.users_data || [];
};

export const getEmployeesList_employee_mgmnt = async () => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");

  const { data } = await http.post("/hr/list-department-heads/", {
    user_id: userId,
    page: 1,
    page_size: 500, // enough for dropdown
  });

  return data.users_data || [];
};

// ✅ FETCH EMPLOYEE BY USER ID (NEW & CORRECT)
export const getEmployeeByUserId = async (targetUserId) => {
  const token = localStorage.getItem("accessToken");
  const authUserId = localStorage.getItem("user_id"); // ✅ LOGGED-IN USER

  if (!token || !authUserId) {
    throw new Error("Session expired");
  }

  const { data } = await http.post("/hr/get-employee/", {
    user_id: authUserId,          // ✅ auth user
    target_user_id: targetUserId  // ✅ employee to fetch
  });

  return data;
};



export const getEmployeeById = async (employeeId) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    throw new Error("Session expired");
  }

  const { data } = await http.post("/hr/get-employee/", {
    user_id: userId,
    employee_id: employeeId
  });

  return data;
};




export const getMyProfile = async () => {
  // 🔍 read from all possible keys
  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");


  if (!userId || !token) {
    throw new Error("Session expired. Please login again.");
  }

  const payload = {
    user_id: userId,
    employee_id: userId,
    id: userId,
  };


  const { data } = await http.post(
    "/users/user-get-profile/",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ FIXED
      },
    }
  );

  return data;
};




/**
 * updateEmployee
 */
export const updateEmployee = async (formData) => {
  const { data } = await http.post(
    "/hr/update-employee/",
    formData
    ,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};



export const deleteEmployee = async (employeeId) => {
  const userId = getUserId();

  const payload = {
    id: employeeId,     // ✅ CORRECT KEY
    user_id: userId,
  };

  const { data } = await http.post(
    "/hr/delete-employee/",
    payload
  );

  return data;
};



export const deleteEmployeedata = async ({ user_id, document_id }) => {
  const payload = {
    user_id,
    document_id,
  };

  const { data } = await http.post(
    "/hr/delete-employee-data/",
    payload
  );

  return data;
};



/* =========================
   GET PersonalEmploymentHistory  
========================= */
export const PersonalEmploymentHistory = async ({
  auth_user_id,   // logged-in user
  employee_id,    // employee whose history we need
  page = 1,
  page_size = 20,
}) => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");

  const { data } = await http.post(
    "/users/user-employee-history/",
    {
      user_id: auth_user_id, // ✅ required by backend
      id: employee_id,       // ✅ required by backend
      page,
      page_size,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};






// IMPORT EMPLOYEES FROM EXCEL
export const importEmployees = async (formData) => {
  const { data } = await http.post(
    "/hr/import-employees/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};



export const exportEmployeesToExcel = async (formData) => {
  const response = await http.post(
    "/hr/export-employees/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",  // Required for Excel download
    }
  );

  return response.data; // blob
};
