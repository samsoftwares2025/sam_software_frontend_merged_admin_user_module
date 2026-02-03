import http from "../http";

/**
 * Helper: get user_id safely from localStorage
 */
const getUserId = () => {
  return localStorage.getItem("user_id") || localStorage.getItem("userId");
};

/**
 * listCompanyDocuments
 * Note: Your Django view expects a POST with JSON body
 */
export const listCompanyDocuments = async (params = {}) => {
  const userId = getUserId();

  const payload = {
    user_id: userId,
    page: params.page || 1,
    page_size: params.page_size || 10,
    search: params.search || "",
    expired_only: params.expired_only || false,
  };

  const { data } = await http.post("/companies/list-company-documents/", payload);
  return data;
};

/**
 * createCompanyDocument
 * (multipart/form-data for handling document files)
 */
export const createCompanyDocument = async (formData) => {
  const userId = getUserId();
  
  // Ensure user_id is present for the backend validation
  if (!formData.has("user_id")) {
    formData.append("user_id", userId);
  }

  const { data } = await http.post(
    "/companies/add-company-document/", 
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * getCompanyDocumentById
 */
export const getCompanyDocumentById = async (docId) => {
  const userId = getUserId();

  const { data } = await http.post("/companies/get-company-document/", {
    user_id: userId,
    document_id: docId,
  });

  return data;
};

/**
 * updateCompanyDocument
 * (multipart/form-data)
 */
export const updateCompanyDocument = async (docId, formData) => {
  const userId = getUserId();

  if (!formData.has("user_id")) formData.append("user_id", userId);
  if (!formData.has("document_id")) formData.append("document_id", docId);

  const { data } = await http.post(
    "/companies/edit-company-document/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * deleteCompanyDocument
 */
export const deleteCompanyDocument = async (docId) => {
  const userId = getUserId();

  const { data } = await http.post("/companies/delete-company-document/", {
    user_id: userId,
    document_id: docId,
  });

  return data;
};