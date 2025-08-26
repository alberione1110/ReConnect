import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ showAuthButtons = true }) => {
  const navigate = useNavigate();

  const goToHome = () => navigate('/');
  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');

  return (
    <header className="global-header">
      <span className="header-logo" onClick={goToHome}>Reconnect</span>
      {showAuthButtons && (
        <div>
          <button className="btn small" onClick={goToLogin}>로그인</button>
          <button className="btn small" onClick={goToSignup}>회원가입</button>
        </div>
      )}
    </header>
  );
};

export default Header;
