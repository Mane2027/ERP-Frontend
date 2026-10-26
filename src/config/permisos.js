export const PERMISOS = {
  "/products": ["admin", "inventario", "vendedor"],
  "/categories": ["admin", "inventario"],
  "/purchases": ["admin", "inventario"],
  "/sales": ["admin", "vendedor"],
  "/providers": ["admin", "inventario"],
  "/inventory": ["admin", "inventario"],
  "/reports": ["admin", "inventario"],
  "/users": ["admin"],
};

// /dashboard no está aquí: lo ve cualquier usuario con sesión
export const puedeVer = (role, ruta) =>
  !PERMISOS[ruta] || PERMISOS[ruta].includes(role);