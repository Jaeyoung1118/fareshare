// src/components/Header.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/authContext";
import './Header.css';

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // 로그아웃 후 로그인 페이지로 리디렉션
    } catch (error) {
      console.error("Error logging out:", error);
      // UI에 에러 메시지를 표시할 수 있습니다.
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuVisible(false); // 메뉴를 닫음
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  // 메뉴 외부를 클릭할 때 메뉴를 닫기 위한 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuVisible && !event.target.closest('.menu-icon') && !event.target.closest('.dropdown-menu')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible]);

  return (
    <div className="header">
      <h1>FareShare</h1>
      <div 
        className="menu-icon" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuVisible}
      >
        &#x22EE; {/* 미트볼 메뉴 아이콘 */}
      </div>
      <div className={`dropdown-menu ${menuVisible ? 'show' : ''}`}>
        <button onClick={() => handleNavigation("/profile")}>Profile</button>
        <button onClick={() => handleNavigation("/contact")}>Contact</button>
        {/* 관리자 전용 메뉴 */}
        {user?.isAdmin && (
          <button onClick={() => handleNavigation("/admin-reservations")}>Admin Reservations</button>
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
