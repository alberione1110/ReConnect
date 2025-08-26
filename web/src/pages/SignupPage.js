import React, { useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import "./SignupPage.css";

const SignupPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [job, setJob] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(true); // 기본값 true

  const handleSignup = async () => {
    // 유효성 검사
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;

    try {
      const res = await axios.post("http://localhost:8080/api/user/save", {
        userId,
        password,
        passwordConfirm,
        name,
        birthDate,
        job,
        isSubscribed,
      });

      alert("회원가입 성공!");
      console.log(res.data);
      // 필요시 로그인 페이지로 이동
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입 실패: " + (error.response?.data?.message || "서버 오류"));
    }
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
