// src/components/AdminRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (user && user.isAdmin) {
    return children; // 관리자인 경우 페이지에 접근 허용
  }

  return <Navigate to="/" />; // 관리자가 아닌 경우 홈으로 리디렉션
};

export default AdminRoute;
