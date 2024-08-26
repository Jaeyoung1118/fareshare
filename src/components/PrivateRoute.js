import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // useAuth 훅 가져오기

const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Auth Context에서 사용자 상태를 가져옵니다.

  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;

