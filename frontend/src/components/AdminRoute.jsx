import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const isAdmin = user?.role === "admin" || user?.isAdmin; 
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
