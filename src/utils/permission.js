export function hasPermission(permissions, module, action = "view") {
  const isClientAdmin = localStorage.getItem("is_client_admin") === "true";

  // 👑 Client Admin → full access
  if (isClientAdmin) return true;

  if (!permissions || !module) return false;

  // Normalize module name (case-insensitive)
  const cleanModule = String(module).trim().toLowerCase();

  const modulePerms = permissions?.[cleanModule];
  if (!modulePerms) return false;

  // Normalize action too (avoid typo issues)
  const cleanAction = String(action).trim().toLowerCase();

  // Return permission or false if undefined
  return modulePerms[cleanAction] === true;
}
