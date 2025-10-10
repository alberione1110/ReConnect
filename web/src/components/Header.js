import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ showLogout = true }) => {
  const navigate = useNavigate();

  const goToHome = () => navigate('/');
  const handleLogout = () => {
    // 필요 시 localStorage.clear() 등 추가 가능
    alert('로그아웃 되었습니다.');
    navigate('/'); // 랜딩 페이지로 이동
  };

  return (
    <header className="global-header">
      <span className="header-logo" onClick={goToHome}>Reconnect</span>
      {showLogout && (
        <div>
          <button className="btn small" onClick={handleLogout}>로그아웃</button>
        </div>
      )}
    </header>
  );
};

export default Header;
