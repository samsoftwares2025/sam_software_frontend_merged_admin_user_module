import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/common/Sidebar";
import Header from "../../../components/common/Header";
import LoaderOverlay from "../../../components/common/LoaderOverlay";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import Pagination from "../../../components/common/Pagination"; // Added Pagination Component
import "../../../assets/styles/admin.css";

import { listShifts, deleteShift } from "../../../api/admin/shift";
import ProtectedAction from "../../../components/admin/ProtectedAction";

function ShiftsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState("attendance");

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Managed by Pagination component
  const [pagination, setPagination] = useState({});

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchShifts = async (pageNo = 1, currentSize = pageSize) => {
    setLoading(true);
    const userId = localStorage.getItem("user_id");

    try {
      const payload = {
        user_id: userId,
        page: pageNo,
        page_size: currentSize,
        search: searchTerm,
      };

      const resp = await listShifts(payload);

      if (resp.success) {
        setShifts(resp.data || []);
        setPagination(resp.pagination || {});
        setPage(pageNo);
      } else {
        setErrorMessage(resp.message || "Failed to load shifts.");
        setShowErrorModal(true);
      }
    } catch (err) {
      setErrorMessage("Unable to connect to the server.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on search or page size change
  useEffect(() => {
    fetchShifts(1, pageSize);
  }, [searchTerm, pageSize]);

  const handlePageChange = (newPage) => {
    fetchShifts(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to page 1 when row count changes
  };

  const handleDeleteClick = (shift) => {
    setShiftToDelete(shift);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const resp = await deleteShift(shiftToDelete.shift_id);
      if (resp.success) {
        setSuccessMessage(resp.message || "Shift deleted successfully.");
        setShowSuccessModal(true);
        fetchShifts(page, pageSize);
      } else {
        setErrorMessage(resp.message || "Failed to delete shift.");
        setShowErrorModal(true);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setErrorMessage(backendMessage || "An unexpected error occurred.");
      setShowErrorModal(true);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {(loading || deleting) && <LoaderOverlay />}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <div className="container">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          <div className="page-title">
            <h3>Work Shifts</h3>
            <p className="subtitle">
              Manage company work timings and grace periods.
            </p>
          </div>

          <div className="filters-container">
            <div className="filters-left">
              <div className="search-input">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filters-right">
              <ProtectedAction
                module="shifts"
                action="add"
                to="/admin/add-shift"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus" /> Add Shift
              </ProtectedAction>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header-bar">
              <h4>
                Shift List{" "}
                <span className="badge-pill">
                  Total: {pagination.total_records || 0}
                </span>
              </h4>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Shift Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Grace Period</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift, index) => {
                    // Calculation remains accurate with dynamic pageSize
                    const orderNumber =
                      (pagination.current_page - 1) * pagination.page_size +
                      index +
                      1;
                    return (
                      <tr key={shift.shift_id}>
                        <td>{orderNumber}</td>
                        <td>
                          <strong>{shift.name}</strong>
                        </td>
                        <td>{shift.start_time}</td>
                        <td>{shift.end_time}</td>
                        <td>{shift.grace_period} Mins</td>
                        <td>
                          <div className="table-actions">
                            <ProtectedAction
                              module="shifts"
                              action="update"
                              to={`/admin/update-shift?id=${shift.shift_id}`}
                              className="icon-btn edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </ProtectedAction>
                            <ProtectedAction
                              module="shifts"
                              action="delete"
                              onAllowed={() => handleDeleteClick(shift)}
                              className="icon-btn delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </ProtectedAction>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && shifts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No shifts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* INTEGRATED REUSABLE PAGINATION COMPONENT */}
            <Pagination
              currentPage={page}
              totalCount={pagination.total_records || 0}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Shift"
          message={`Are you sure you want to delete "${shiftToDelete?.name}"? Employees currently assigned to this shift will need to be reassigned.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export default ShiftsPage;