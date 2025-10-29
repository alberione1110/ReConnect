// src/pages/SignupPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { signUp } from "../services/reconnect";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [job, setJob] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isFutureDate = (yyyy, mm, dd) => {
    if (!yyyy || !mm || !dd) return true;
    const d = new Date(`${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
    const today = new Date();
    // 시간대 이슈 방지: 00:00로 고정
    const dUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const tUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    return dUTC > tUTC;
  };

  const handleSignup = async () => {
    if (loading) return;
    setMsg("");

    const id = userId.trim();
    const pw = password.trim();
    const pwc = passwordConfirm.trim();
    const nm = name.trim();

    if (!id) return setMsg("아이디(이메일)를 입력하세요.");
    if (!pw) return setMsg("비밀번호를 입력하세요.");
    if (pw !== pwc) return setMsg("비밀번호가 일치하지 않습니다.");
    if (!nm) return setMsg("이름을 입력하세요.");
    if (!birthYear || !birthMonth || !birthDay) return setMsg("생년월일을 모두 선택하세요.");
    if (isFutureDate(birthYear, birthMonth, birthDay)) return setMsg("유효한 생년월일을 선택하세요.");

    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(
      birthDay
    ).padStart(2, "0")}`;

    try {
      setLoading(true);
      await signUp({
        userId: id,
        password: pw,
        passwordConfirm: pwc, // 백엔드 검증에 필요
        name: nm,
        birthDate,
        job,
        isSubscribed,
      });
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/login", { replace: true });
    } catch (e) {
      const backendMsg = e?.response?.data;
      const errMsg =
        (typeof backendMsg === "string" && backendMsg) ||
        e?.response?.data?.message ||
        "회원가입 중 오류가 발생했습니다.";
      setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Header requireAuth={false} showLogout={false} />

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">회원가입</h2>

          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            placeholder="아이디 또는 이메일"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onBlur={() => setUserId((v) => v.trim())}
            disabled={loading}
          />

          <label className="auth-label">비밀번호</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <label className="auth-label">비밀번호 확인</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호 재입력"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            disabled={loading}
          />

          <label className="auth-label">이름</label>
          <input
            className="auth-input"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <label className="auth-label">생년월일</label>
          <div className="auth-birth-row">
            <select
              className="auth-select"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              disabled={loading}
            >
              <option value="">년도</option>
              {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              className="auth-select"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              disabled={loading}
            >
              <option value="">월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              className="auth-select"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              disabled={loading}
            >
              <option value="">일</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <label className="auth-label">직업</label>
          <select
            className="auth-select full"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            disabled={loading}
          >
            <option value="">직업 선택</option>
            <option value="학생">학생</option>
            <option value="직장인">직장인</option>
            <option value="프리랜서">프리랜서</option>
            <option value="기타">기타</option>
          </select>

          <div style={{ marginTop: "10px", textAlign: "left" }}>
            <label>
              <input
                type="checkbox"
                checked={isSubscribed}
                onChange={(e) => setIsSubscribed(e.target.checked)}
                disabled={loading}
              />
              &nbsp; 뉴스레터 구독
            </label>
          </div>

          {msg && <div className="auth-error">{msg}</div>}

          <button className="auth-submit" onClick={handleSignup} disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
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

export default SignupPage;
