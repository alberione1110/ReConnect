// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import QuestionPage from './pages/QuestionPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import InitialSurveyPage from './pages/InitialSurveyPage'; // ✅ 추가

function App() {
  return (
    <Router>
      <Routes>
        {/* 랜딩 */}
        <Route path="/" element={<LandingPage />} />

        {/* 인증 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 서비스 */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/report" element={<ReportPage />} />

        {/* ✅ 초기 설문 */}
        <Route path="/survey" element={<InitialSurveyPage />} />
      </Routes>
    </Router>
  );
}
export default App;
