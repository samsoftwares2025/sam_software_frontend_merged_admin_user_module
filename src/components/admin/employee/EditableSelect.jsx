import React, { useState } from "react";
import Select, { components } from "react-select";

/* ===== Option with Edit icon ===== */
const OptionWithEdit = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* LABEL */}
        <span
          style={{
            flex: 1,
            minWidth: 0,              // 🔑 required for ellipsis
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={data.label}          // 👌 full text on hover
        >
          {data.label}
        </span>

        {/* EDIT ICON */}
        {data.onEdit && !data.isAdd && (
          <span
            style={{
              flexShrink: 0,
              cursor: "pointer",
              color: "#0d6efd",
            }}
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit(data);
            }}
            title="Edit"
          >
            ✏️
          </span>
        )}
      </div>
    </components.Option>
  );
};


export default function EditableSelect({
  options = [],
  value,
  placeholder,
  styles,

  /* callbacks from parent */
  onChange,
  onCreate,
  onUpdate,
  onRefresh, // optional
isDisabled = false, 
  /* dropdown control */
  menuIsOpen,
  onMenuOpen,
  onMenuClose,
}) {
  const [mode, setMode] = useState(null); // "add" | "edit"
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);

  /* ===== Start Add ===== */
  const startAdd = () => {
    setMode("add");
    setInputValue("");
    onMenuClose?.();
  };

  /* ===== Start Edit ===== */
  const startEdit = (opt) => {
    setMode("edit");
    setEditingId(opt.value);
    setInputValue(opt.label);
    onMenuClose?.();
  };

  /* ===== Save ===== */
  const handleSave = async () => {
    if (!inputValue.trim()) return;

    if (mode === "add") {
      await onCreate?.(inputValue.trim());
    }

    if (mode === "edit") {
      await onUpdate?.(editingId, inputValue.trim());
    }

    setMode(null);
    setInputValue("");
    setEditingId(null);
  };

  /* ===== Final options ===== */
  const finalOptions = [
    ...options.map((o) => ({
      ...o,
      onEdit: startEdit,
    })),
    onCreate ? { value: "__add__", label: "+ Add", isAdd: true } : null,
  ].filter(Boolean);

  return (
    <>
      {/* ===== SELECT + REFRESH (HORIZONTAL ALWAYS) ===== */}
      <div className="editable-select-wrapper">
        <div className="editable-select-main">
          <Select
            styles={styles}
            options={finalOptions}
            placeholder={placeholder}
            components={{ Option: OptionWithEdit }}
            value={finalOptions.find((o) => o.value === value) || null}
            isDisabled={isDisabled}
            menuIsOpen={menuIsOpen}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
            onChange={(opt) => {
              if (!opt) return;

              if (opt.isAdd) {
                startAdd();
                return;
              }

              onChange?.(opt.value);
              onMenuClose?.();
            }}
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            className="btn btn-secondary editable-select-refresh"
            onClick={onRefresh}
            title="Refresh"
          >
            <i className="fa-solid fa-rotate-right" />
          </button>
        )}
      </div>

      {/* ===== ADD / EDIT FORM ===== */}
      {mode && (
        <div className="form-group" style={{ marginTop: 10 }}>
          <input
            className="form-input"
            placeholder={mode === "add" ? "Enter name" : "Edit name"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setMode(null);
                setInputValue("");
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
