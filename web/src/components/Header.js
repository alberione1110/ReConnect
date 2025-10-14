import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ requireAuth = true, showLogout = true }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ 인증이 필요한 페이지에서만 가드 작동
  useEffect(() => {
    if (requireAuth && !token) {
      // alert("로그인이 필요합니다."); // 원하면 주석 해제
      navigate("/", { replace: true });
    }
  }, [requireAuth, token, navigate]);

  const goToHome = () => navigate("/home");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("coupleCode");
    alert("로그아웃 되었습니다.");
    navigate("/", { replace: true });
  };

  return (
    <header className="global-header">
      <span className="header-logo" onClick={goToHome}>
        Reconnect
      </span>
      {showLogout && (
        <div>
          <button className="btn small" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
