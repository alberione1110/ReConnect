// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { login, getMySurveySafe } from "../services/reconnect"; // ← 설문 확인 추가
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const goToSignup = () => navigate("/signup");

  const handleLogin = async () => {
    if (loading) return;
    setMsg("");

    const id = userId.trim();
    const pw = password.trim();
    if (!id || !pw) {
      setMsg("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 세션 로그인 (JSESSIONID 설정). 응답은 UserDto
      const { data: userDto } = await login(id, pw);

      // ✅ 프론트 세션 마커
      localStorage.setItem("userId", id);
      localStorage.setItem("auth", "1");

      // ✅ 응답에서 커플코드 확인
      const coupleCode = userDto?.coupleCode || "";
      if (!coupleCode) {
        // 커플 연결 전이면 연결 페이지로
        localStorage.removeItem("coupleCode");
        navigate("/couple", { replace: true });
        return;
      }

      // 커플코드 저장
      localStorage.setItem("coupleCode", coupleCode);

      // ✅ 설문 완료 여부 확인 -> 완료면 홈, 아니면 설문 페이지
      const survey = await getMySurveySafe(); // 404면 null
      if (survey) {
        localStorage.setItem("surveyCompleted", "true");
        navigate("/home", { replace: true });
      } else {
        localStorage.removeItem("surveyCompleted");
        navigate("/survey", { replace: true });
      }
    } catch (e) {
      const status = e?.response?.status;
      const backendMsg = e?.response?.data;
      const m =
        (status === 401 && "아이디 또는 비밀번호가 올바르지 않습니다.") ||
        (typeof backendMsg === "string" ? backendMsg : null) ||
        "로그인 중 문제가 발생했습니다.";
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header requireAuth={false} showLogout={false} />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">로그인</h2>
            <button className="auth-switch" onClick={goToSignup} disabled={loading}>
              회원가입
            </button>
          </div>

          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onBlur={() => setUserId((v) => v.trim())}
            disabled={loading}
          />

          <label className="auth-label">비밀번호</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={loading}
          />

          {msg && (
            <div className="auth-error" role="alert">
              {msg}
            </div>
          )}

          <div className="auth-links">
            <span className="auth-link">아이디 찾기</span>
            <span className="auth-link">비밀번호 찾기</span>
          </div>

          <button className="auth-submit" onClick={handleLogin} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="auth-divider">
            <span className="auth-divider-text">or</span>
          </div>

          <button className="auth-social google" disabled>
            Google로 로그인
          </button>
          <button className="auth-social kakao" disabled>
            Kakao로 로그인
          </button>
          <button className="auth-social naver" disabled>
            Naver로 로그인
          </button>
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
