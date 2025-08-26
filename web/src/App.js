// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiaryPage from './pages/DiaryPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';  // 추가
import SignupPage from './pages/SignupPage'; // 추후 사용 대비

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
