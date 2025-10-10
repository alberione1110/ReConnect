import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 추가
import Header from "../components/Header";
// axios 제거
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
  const [isSubscribed, setIsSubscribed] = useState(true); // 기본값 true
  const [msg, setMsg] = useState(""); // 오류 메시지 표시용

  const handleSignup = async () => {
    setMsg("");

    // 간단 유효성 검사
    if (!userId.trim()) return setMsg("아이디(이메일)를 입력하세요.");
    if (!password.trim()) return setMsg("비밀번호를 입력하세요.");
    if (password !== passwordConfirm) return setMsg("비밀번호가 일치하지 않습니다.");
    if (!name.trim()) return setMsg("이름을 입력하세요.");
    if (!birthYear || !birthMonth || !birthDay) return setMsg("생년월일을 모두 선택하세요.");

    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

    // 실제 API 호출 대신 모의 처리
    await new Promise((r) => setTimeout(r, 400)); // UX용 짧은 지연
    alert("회원가입(모의) 성공!");

    // 필요 시 로컬 스토리지 등 임시 저장 가능 (원치 않으면 제거)
    // localStorage.setItem("mock_user", JSON.stringify({ userId, name, birthDate, job, isSubscribed }));

    // 회원가입 후 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <div className="signup-page">
      <Header showAuthButtons={false} />

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">회원가입</h2>

          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            placeholder="아이디 또는 이메일"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <label className="auth-label">비밀번호</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="auth-label">비밀번호 확인</label>
          <input
            className="auth-input"
            type="password"
            placeholder="비밀번호 재입력"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSignup(); }}
          />

          <label className="auth-label">이름</label>
          <input
            className="auth-input"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="auth-label">생년월일</label>
          <div className="auth-birth-row">
            <select className="auth-select" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
              <option value="">년도</option>
              {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select className="auth-select" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
              <option value="">월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select className="auth-select" value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
              <option value="">일</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <label className="auth-label">직업</label>
          <select className="auth-select full" value={job} onChange={(e) => setJob(e.target.value)}>
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
              />
              &nbsp; 뉴스레터 구독
            </label>
          </div>

          {/* 오류 메시지 */}
          {msg && <div className="auth-error" role="alert">{msg}</div>}

          <button className="auth-submit" onClick={handleSignup}>회원가입</button>
        </div>

        <div className="auth-quote">
          <p>Start with a diary.<br />shift your day.</p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
