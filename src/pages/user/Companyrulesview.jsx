import React, { useEffect, useRef, useState } from "react";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import LoaderOverlay from "../../components/common/LoaderOverlay";
import ErrorModal from "../../components/common/ErrorModal";

import { getMyCompanyRules } from "../../api/user/companyrule"; // ✅ FIXED PATH

const MyCompanyRules = () => {
  /* ===== SIDEBAR STATE ===== */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  /* ===== DATA ===== */
  const [rules, setRules] = useState([]);

  /* ===== UI STATE ===== */
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetched = useRef(false);

  /* =====================
     FETCH COMPANY RULES
  ===================== */
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchRules = async () => {
      try {
        const res = await getMyCompanyRules();

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load company rules.");
        }

        setRules(Array.isArray(res.rules) ? res.rules : []);
      } catch (err) {
        setErrorMessage(
          err?.message || "Something went wrong while loading company rules."
        );
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
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
              <h3>COMPANY RULES</h3>
              <div className="card-amount-row">
                <div>
                  <div className="small">Total rules</div>
                  <div className="big">{rules.length}</div>
                  <div className="sub">Policies & Guidelines</div>
                </div>
                <div className="mini-wrap">
                  <i className="fa-solid fa-scale-balanced fa-2x" />
                </div>
              </div>
            </div>
          </section>

          {/* ===== RULE LIST ===== */}
          <section className="card doc-section">
            <div className="doc-header">
              <div>
                <h3 className="info-title">Company Rules</h3>
                <p className="doc-subtitle">
                  Official company policies published by HR
                </p>
              </div>
            </div>

            {rules.length === 0 ? (
              <p className="small">No rules published yet.</p>
            ) : (
              <div className="doc-table">
                {rules.map((rule) => (
                  <div className="doc-row" key={rule.id}>
                    <div className="doc-col name">
                      <span className="doc-name">{rule.title}</span>
                      {rule.short_description && (
                        <p className="small">{rule.short_description}</p>
                      )}
                    </div>

                    <div className="doc-col note">
                      {rule.description || "-"}
                    </div>

                    <div className="doc-col actions">
                      {rule.image ? (
                        <button
                          type="button"
                          className="doc-action-btn"
                          onClick={() => window.open(rule.image, "_blank")}
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

export default MyCompanyRules;
