import { useAuth } from "../../context/AuthContext";
import { refreshUserPermissions } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ProtectedAction = ({
  module,
  action = "view",
  to,
  onAllowed,          // 🔥 add this
  children,
  className,
  ...rest
}) => {
  const { isClientAdmin, setLoginData } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const cleanModule = module.trim().toLowerCase();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();   // 🔥 important for table buttons

    // --- ADMIN ALWAYS ALLOWED ---
    if (isClientAdmin) {
      if (onAllowed) onAllowed(e);  // 🔥 allow local actions
      else if (to) navigate(to);
      return;
    }

    // --- REFRESH PERMISSIONS ---
    const newPermissions = await refreshUserPermissions();
    if (newPermissions) {
      localStorage.setItem("permissions", JSON.stringify(newPermissions));
      setLoginData();
    }

    const allowed = newPermissions?.[cleanModule]?.[action] === true;

    if (allowed) {
      if (onAllowed) onAllowed(e);  // 🔥 main fix: call your function!
      else if (to) navigate(to);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button className={className} onClick={handleClick} {...rest}>
        {children}
      </button>

      {showModal && (
        <div className="modal-overlay small-modal">
          <div className="modal-card">
            <h3>No Permission</h3>
            <p>You do not have permission to access this feature.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedAction;
