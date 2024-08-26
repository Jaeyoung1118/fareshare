// src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/authContext";
import AdminReservations from "./pages/AdminReservations"; // AdminReservations 컴포넌트 import 추가

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // 로딩 중인 상태를 처리할 수 있습니다.
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인되지 않은 경우 루트 경로에서 로그인 페이지로 이동 */}
          <Route path="/" element={user ? <Navigate to="/home" /> : <Login />} />
          
          {/* 로그인 후 홈으로 리디렉션 */}
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/booking" 
            element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            } 
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          {/* 관리자가 접근할 수 있는 경로 */}
          <Route
            path="/admin-reservations"
            element={
              <PrivateRoute>
                <AdminReservations />
              </PrivateRoute>
            }
          />
          {/* 모든 잘못된 경로는 홈으로 리디렉션 */}
          <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
