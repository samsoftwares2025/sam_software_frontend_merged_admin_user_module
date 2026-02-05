import React from "react";

const Pagination = ({ 
  currentPage, 
  totalCount, 
  pageSize, 
  onPageChange,
  onPageSizeChange, // <--- New Prop function
  pageSizeOptions = [5,10, 20, 50, 100] // <--- Default options
}) => {
  // If no items, don't render anything
  if (totalCount === 0) return null;

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalCount);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="table-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      
      {/* LEFT SIDE: Info + Page Size Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div id="tableInfo">
          Showing {startRow} to {endRow} of {totalCount} entries
        </div>

        {/* Page Size Selector */}
        <div className="page-size-selector" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize); // Call parent function
            }}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* RIGHT SIDE: Buttons */}
      <div className="pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => handlePageClick(currentPage - 1)}
        >
          <i className="fa-solid fa-angle-left"></i>
        </button>

        {/* Optional: Simple "Page X of Y" if lists get very long, 
            or keep your existing number array logic */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={p === currentPage ? "active-page" : ""}
            onClick={() => handlePageClick(p)}
          >
            {p}
          </button>
        ))}

        <button 
          disabled={currentPage === totalPages} 
          onClick={() => handlePageClick(currentPage + 1)}
        >
          <i className="fa-solid fa-angle-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;