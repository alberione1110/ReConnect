import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const goToSignup = () => navigate("/signup");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/user/login", {
        userId,
        password,
      });

      // 로그인 성공 시 토큰 저장 (있다면)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // 로그인 성공 시 이동
      alert("로그인 성공");
      navigate("/diary"); // 또는 원하는 페이지로 이동
    } catch (error) {
      console.error("로그인 실패", error);
      alert("로그인 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  };

  return (
    <div className="login-page">
      <Header showAuthButtons={false} />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">로그인</h2>
            <button className="auth-switch" onClick={goToSignup}>회원가입</button>
          </div>

          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <label className="auth-label">비밀번호</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-links">
            <span className="auth-link">아이디 찾기</span>
            <span className="auth-link">비밀번호 찾기</span>
          </div>

          <button className="auth-submit" onClick={handleLogin}>로그인</button>

          <div className="auth-divider">
            <span className="auth-divider-text">or</span>
          </div>

          <button className="auth-social google">Google로 로그인</button>
          <button className="auth-social kakao">Kakao로 로그인</button>
          <button className="auth-social naver">Naver로 로그인</button>
        </div>

        <div className="auth-quote">
          <p>Start with a diary.<br />shift your day.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
