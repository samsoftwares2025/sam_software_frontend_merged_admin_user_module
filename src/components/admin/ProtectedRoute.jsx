import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({
  children,
  module,
  action = "view",
  noPermissionCheck = false,
}) => {
  const { isAuthenticated, permissions, isClientAdmin, isLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const cleanModule = module?.trim().toLowerCase() || null;

  const hasAccess =
    isClientAdmin ||
    noPermissionCheck ||
    permissions?.[cleanModule]?.[action] === true;

  useEffect(() => {
    if (!isAuthenticated || isClientAdmin || noPermissionCheck) {
      setShowModal(false);
      return;
    }

    if (!hasAccess) setShowModal(true);
    else setShowModal(false);
  }, [
    isAuthenticated,
    permissions,
    isClientAdmin,
    noPermissionCheck,
    hasAccess,
  ]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  /* =============== NO PERMISSION =============== */
  if (!hasAccess) {
    const dashboard = isClientAdmin ? "/admin/dashboard" : "/user/dashboard";

    const handleClose = () => {
      setShowModal(false);
      window.location.href = dashboard; // 🔥 redirect appropriately
    };

    return (
      <>
        {showModal && (
          <div className="modal-overlay small-modal">
            <div className="modal-card">
              <h3>No Permission</h3>
              <p>You do not have permission to access this module.</p>

              <button className="btn btn-primary" onClick={handleClose}>
                OK
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
