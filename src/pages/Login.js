// src/pages/Login.js

import React, { useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // useAuth 훅을 가져옵니다.

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 현재 로그인된 사용자 정보 가져오기

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/home"); // 사용자가 로그인되어 있으면 /home으로 리디렉션
    }
  }, [user, navigate]);

  return (
    <div>
      <h2>Login</h2>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default Login;
