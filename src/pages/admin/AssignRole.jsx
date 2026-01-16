import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "../../assets/styles/admin.css";

import { listUserRoles } from "../../api/admin/roles";
import {
  getEmployeeMasterData,
  filterEmployeeMasterData,
} from "../../api/admin/employees";
import { getDepartments } from "../../api/admin/departments";

const AssignRole = () => {
  /* ================= ROUTER ================= */
  const { roleId } = useParams();
  const navigate = useNavigate();

  /* ================= SIDEBAR ================= */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("roles");

  /* ================= ROLE ================= */
  const [roleName, setRoleName] = useState("");

  /* ================= USERS ================= */
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  /* ================= FILTERS ================= */
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  /* ================= DROPDOWNS ================= */
  const [departments, setDepartments] = useState([]);

  /* ================= SELECTION ================= */
  const [selectedUsers, setSelectedUsers] = useState([]);

  /* ================= LOAD ROLE NAME ================= */
  useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await listUserRoles();
        if (res?.success) {
          const role = res.user_roles.find(
            (r) => String(r.id) === String(roleId)
          );

          if (!role) {
            alert("Role not found");
            navigate("/admin/roles");
            return;
          }

          setRoleName(role.role);
        }
      } catch (err) {
        console.error("FAILED TO LOAD ROLE", err);
      }
    };

    if (roleId) loadRole();
  }, [roleId, navigate]);

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments();
        setDepartments(res?.departments || []);
      } catch (err) {
        console.error("FAILED TO LOAD DEPARTMENTS", err);
      }
    };

    loadDepartments();
  }, []);

  /* ================= LOAD USERS ================= */
  const loadUsers = async (filters = {}) => {
    setLoadingUsers(true);
    try {
      const res =
        filters.search || filters.department
          ? await filterEmployeeMasterData(filters)
          : await getEmployeeMasterData();

      if (res?.success) {
        setUsers(res.users_data || []);
        setSelectedUsers([]); // 🔥 reset selection on reload
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("FAILED TO LOAD USERS", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= FILTER HANDLER ================= */
  useEffect(() => {
    loadUsers({
      search,
      department,
    });
  }, [search, department]);

  /* ================= CLEAR FILTERS ================= */
  const handleClearFilters = () => {
    setSearch("");
    setDepartment("");
    loadUsers();
  };

  /* ================= SELECT ALL ================= */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  /* ================= SELECT SINGLE ================= */
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="container">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <main className="main">
        <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

        {/* ================= PAGE HEADER ================= */}
        <div className="page-header">
          <div className="page-title">
            <h3>
              Assign Users to{" "}
              <span style={{ color: "#2563eb" }}>
                {roleName || "Loading..."}
              </span>{" "}
              Role
            </h3>
            <p>Select users and assign them to this role.</p>
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="filters-container">
          <div className="filters-left">
            {/* Search */}
            <div className="search-input">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Department */}
            <select
              className="filter-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <button className="btn btn-ghost" onClick={handleClearFilters}>
              <i className="fa-solid fa-filter-circle-xmark" /> Clear Filters
            </button>
          </div>
        </div>

        {/* ================= USERS TABLE ================= */}
        <section className="table-container">
          <div className="data-table-wrapper">
            {loadingUsers ? (
              <div style={{ padding: "1.5rem" }}>Loading users...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          users.length > 0 &&
                          selectedUsers.length === users.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No users found
                      </td>
                    </tr>
                  )}

                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                        />
                      </td>
                      <td className="emp-name">{u.name}</td>
                      <td>{u.official_email}</td>
                      <td>{u.department || "-"}</td>
                      <td>{u.designation || "-"}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            u.is_active
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ================= ACTIONS ================= */}
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/roles")}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={selectedUsers.length === 0}
          >
            Add Selected Users
          </button>
        </div>
      </main>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default AssignRole;
