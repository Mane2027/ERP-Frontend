import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../services/auth";

export default function RoleRoute({ roles }) {
  const user = getUser();
  return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}