import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const goToSignup = () => navigate("/signup");

  const handleLogin = async () => {
    setMsg("");
    if (!userId.trim() || !password.trim()) {
      setMsg("아이디와 비밀번호를 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));

      // ✅ 로그인 성공 시 토큰 저장 (임시)
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("userId", userId);

      alert("로그인 성공");
      navigate("/home");
    } catch (e) {
      setMsg("알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 로그인/회원가입 페이지는 인증 검증 안함 */}
      <Header requireAuth={false} showLogout={false} />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">로그인</h2>
            <button className="auth-switch" onClick={goToSignup}>
              회원가입
            </button>
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {msg && <div className="auth-error">{msg}</div>}

          <div className="auth-links">
            <span className="auth-link">아이디 찾기</span>
            <span className="auth-link">비밀번호 찾기</span>
          </div>

          <button
            className="auth-submit"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="auth-divider">
            <span className="auth-divider-text">or</span>
          </div>

          <button className="auth-social google">Google로 로그인</button>
          <button className="auth-social kakao">Kakao로 로그인</button>
          <button className="auth-social naver">Naver로 로그인</button>
        </div>

        <div className="auth-quote">
          <p>
            Start with a diary.
            <br />
            shift your day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
