import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { getUser } from '../services/reconnect';

const LandingPage = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 선택형 자동 라우팅: 세션 유지 + userId 남아있으면 홈/커플로 스킵
        const id = localStorage.getItem('userId');
        if (!id) return;
        const { data } = await getUser(id); // 세션 만료시 401/500일 수 있음
        if (!alive) return;
        if (data?.coupleCode) {
          navigate('/home', { replace: true });
        } else {
          navigate('/couple', { replace: true });
        }
      } catch {
        // 세션이 없거나 만료: 랜딩 유지
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [navigate]);

  if (checking) {
    // 디자인 영향 최소: 간단한 로딩만
    return (
      <div className="landing-container">
        <div className="landing-content">
          <h1 className="landing-logo">Reconnect</h1>
          <p className="landing-subtitle">연인과 함께 쓰는 감정 다이어리</p>
          <div className="button-group" style={{ opacity: 0.5 }}>
            <button className="btn primary" disabled>로그인</button>
            <button className="btn secondary" disabled>회원가입</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-logo">Reconnect</h1>
        <p className="landing-subtitle">연인과 함께 쓰는 감정 다이어리</p>

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
