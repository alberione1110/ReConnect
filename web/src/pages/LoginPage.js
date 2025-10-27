import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { login, getUser, signUp } from "../services/reconnect"; // ✅ signUp도 import
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

    const id = userId.trim();
    const pw = password.trim();
    if (!id || !pw) {
      setMsg("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 실제 로그인 호출
      const { data: loginData } = await login(id, pw);
      const token = loginData?.token || "mock-token";
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);

      // ✅ 로그인 후 내 정보 조회 (id가 빈 값이면 호출하지 않음)
      try {
        const { data } = await getUser(id);
        const code = data?.coupleCode || "";
        if (code) {
          localStorage.setItem("coupleCode", code);
          navigate("/home", { replace: true });
        } else {
          navigate("/couple", { replace: true });
        }
      } catch (e) {
        // 404면 유저가 없을 수 있으므로, 자동 회원가입 옵션
        if (e?.response?.status === 404) {
          try {
            await signUp({
              userId: id,
              password: pw,
              name: id,
              birthDate: "1990-01-01",
              job: "기타",
              isSubscribed: true,
            });
            navigate("/couple", { replace: true });
          } catch {
            navigate("/couple", { replace: true });
          }
        } else {
          navigate("/couple", { replace: true });
        }
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 401 ? "아이디 또는 비밀번호가 올바르지 않습니다." : null) ||
        "로그인 중 문제가 발생했습니다.";
      setMsg(msg);
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
            onBlur={() => setUserId((v) => v.trim())}  // ✅ 공백 제거
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

          {msg && <div className="auth-error" role="alert">{msg}</div>}

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

          <button className="auth-social google" disabled>Google로 로그인</button>
          <button className="auth-social kakao" disabled>Kakao로 로그인</button>
          <button className="auth-social naver" disabled>Naver로 로그인</button>
        </div>

        <div className="auth-quote">
          <p>Start with a diary.<br/>shift your day.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
