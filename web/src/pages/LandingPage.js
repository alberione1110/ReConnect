import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        {/* 서비스 로고/타이틀 */}
        <h1 className="landing-logo">Reconnect</h1>
        <p className="landing-subtitle">연인과 함께 쓰는 감정 다이어리</p>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <button className="btn primary" onClick={() => navigate('/login')}>
            로그인
          </button>
          <button className="btn secondary" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
