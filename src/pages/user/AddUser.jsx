import React, { useState } from "react";
import Header from "../../components/common/Header";
import "../../assets/styles/user.css";

const AddUser = ({ sidebarOpen, onToggleSidebar }) => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  /* ===== MOCK DATA ===== */
  const users = [
    { name: "Amit Sharma", email: "amit@company.com", dept: "HR", desig: "HR Executive", active: true },
    { name: "Priya Verma", email: "priya@company.com", dept: "Finance", desig: "Accountant", active: true },
    { name: "Rahul Mehta", email: "rahul@company.com", dept: "Engineering", desig: "Software Engineer", active: true },
    { name: "Sneha Patel", email: "sneha@company.com", dept: "HR", desig: "HR Manager", active: false },
    { name: "Karan Singh", email: "karan@company.com", dept: "Sales", desig: "Sales Executive", active: true },
  ];

  const departmentDesignations = {
    HR: ["HR Executive", "HR Manager"],
    Finance: ["Accountant", "Finance Manager"],
    Engineering: ["Software Engineer", "Tech Lead"],
    Sales: ["Sales Executive", "Sales Manager"],
  };

  /* ===== FILTERED USERS ===== */
  const filteredUsers = users.filter((u) => {
    return (
      (!search || u.name.toLowerCase().includes(search.toLowerCase())) &&
      (!department || u.dept === department) &&
      (!designation || u.desig === designation)
    );
  });

  return (
    <main id="main" className="main" role="main">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />

      {/* ================= PAGE HEADER ================= */}
      <div className="header">
        <div className="page-title">
          <h1>Add Users to Role</h1>
          <p className="subtitle">
            Select users and assign them to this role.
          </p>
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
            onChange={(e) => {
              setDepartment(e.target.value);
              setDesignation("");
            }}
          >
            <option value="">All Departments</option>
            {Object.keys(departmentDesignations).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Designation (depends on department) */}
          <select
            className="filter-select"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            disabled={!department}
          >
            <option value="">All Designations</option>
            {department &&
              departmentDesignations[department].map((des) => (
                <option key={des} value={des}>{des}</option>
              ))}
          </select>
        </div>
      </div>

      {/* ================= USERS TABLE ================= */}
      <section className="table-container">
        <div className="table-header-bar">
          <h4>
            Available Users <span className="badge-pill">{filteredUsers.length}</span>
          </h4>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.email}>
                  <td><input type="checkbox" /></td>
                  <td className="emp-name">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.dept}</td>
                  <td>{u.desig}</td>
                  <td>
                    <span className={`status-pill ${u.active ? "status-active" : "status-inactive"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= ACTIONS ================= */}
      <div className="form-actions">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary">
          Add Selected Users
        </button>
      </div>
    </main>
  );
};

export default AddUser;
