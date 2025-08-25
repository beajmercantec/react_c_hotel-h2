import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../api/apiClient";

export default function RequireAuth() {
  const token = getToken();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}