// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // 새로 만든 랜딩 페이지
import HomePage from './pages/HomePage';
import DiaryPage from './pages/DiaryPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 첫 진입은 랜딩 페이지 */}
        <Route path="/" element={<LandingPage />} />

        {/* 인증 관련 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 로그인 성공 시 접근할 메인 서비스 페이지 */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
