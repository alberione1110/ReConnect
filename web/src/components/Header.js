// src/components/Header.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Header.css";

/**
 * props
 * - requireAuth: 기본 true. 인증 필요한 페이지에서 가드 동작
 * - showLogout: 기본 true. 우측에 로그아웃 버튼 표시
 * - showAuthButtons: 기본 true. 비로그인 상태에서 로그인/회원가입 버튼 표시
 */
const Header = ({
  requireAuth = true,
  showLogout = true,
  showAuthButtons = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 간단 가드: localStorage 마커 기반
  useEffect(() => {
    if (!requireAuth) return;
    const isAuthed =
      !!localStorage.getItem("auth") || !!localStorage.getItem("userId");
    if (!isAuthed) {
      const unauthPaths = ["/", "/login", "/signup"];
      if (!unauthPaths.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [requireAuth, navigate, location.pathname]);

  const handleLogout = () => {
    // 프론트 상태 초기화 (백엔드 세션 종료는 필요시 별도 호출)
    localStorage.removeItem("auth");
    localStorage.removeItem("userId");
    localStorage.removeItem("coupleCode");
    navigate("/", { replace: true });
  };

  const isAuthed =
    !!localStorage.getItem("auth") || !!localStorage.getItem("userId");

  return (
    <header className="global-header">
      {/* 좌측 로고 */}
      <div className="header-logo">
        <Link to="/home" style={{ color: "inherit", textDecoration: "none" }}>
          Reconnect
        </Link>
      </div>

      {/* 우측 액션 */}
      <div className="header-actions">
        {!isAuthed && showAuthButtons ? (
          <>
            <button
              className="btn small"
              type="button"
              onClick={() => navigate("/login")}
            >
              로그인
            </button>
            <button
              className="btn small"
              type="button"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </button>
          </>
        ) : (
          showLogout && (
            <button
              className="btn small"
              type="button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
