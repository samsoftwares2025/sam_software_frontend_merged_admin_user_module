import React, { useEffect, useRef, useState } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import ErrorModal from "../../components/common/ErrorModal";

import { getMyCompanyPolicies } from "../../api/user/companypolicy";

const MyCompanyPolicies = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===== DATA ===== */
  const [policies, setPolicies] = useState([]);

  /* ===== UI STATE ===== */
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetched = useRef(false);

  /* =======================
     FETCH COMPANY POLICIES
  ======================= */
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchPolicies = async () => {
      try {
        const res = await getMyCompanyPolicies();

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load company policies.");
        }

        setPolicies(Array.isArray(res.policies) ? res.policies : []);
      } catch (err) {
        setErrorMessage(
          err?.message ||
            "Something went wrong while loading company policies."
        );
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <>
      {/* ===== LOADER ===== */}
      {loading && <LoaderOverlay />}

      {/* ===== ERROR MODAL ===== */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <div className="container">
        {/* ===== SIDEBAR ===== */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* ===== MAIN ===== */}
        <main className="main">
          <Header onMenuClick={() => setIsSidebarOpen((p) => !p)} />

          {/* ===== SUMMARY ===== */}
          <section className="top-grid">
            <div className="card">
              <h3>COMPANY POLICIES</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">Total policies</div>
                  <div className="big">{policies.length}</div>
                  <div className="sub">HR & Company Guidelines</div>
                </div>
                <div className="mini-wrap">
                  <i className="fa-solid fa-file-shield fa-2x" />
                </div>
              </div>
            </div>
          </section>

          {/* ===== POLICY LIST ===== */}
          <section className="card doc-section">
            <div className="doc-header">
              <div>
                <h3 className="info-title">Company Policies</h3>
                <p className="doc-subtitle">
                  Official company policies published by management
                </p>
              </div>
            </div>

            {policies.length === 0 ? (
              <p className="small">No policies published yet.</p>
            ) : (
              <div className="doc-table">
                {policies.map((policy) => (
                  <div className="doc-row" key={policy.id}>
                    <div className="doc-col name">
                      <span className="doc-name">{policy.title}</span>
                      {policy.short_description && (
                        <p className="small">
                          {policy.short_description}
                        </p>
                      )}
                    </div>

                    <div className="doc-col note">
                      {policy.description || "-"}
                    </div>

                    <div className="doc-col actions">
                      {policy.image ? (
                        <button
                          type="button"
                          className="doc-action-btn"
                          onClick={() =>
                            window.open(policy.image, "_blank")
                          }
                        >
                          <i className="fa-regular fa-eye" /> View Image
                        </button>
                      ) : (
                        <span className="small">No attachment</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default MyCompanyPolicies;
