// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 공개/인증 페이지들
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import CoupleConnectPage from "./pages/CoupleConnectPage";
import QuestionPage from "./pages/QuestionPage";
import InitialSurveyPage from "./pages/InitialSurveyPage";

// 보고/보기 페이지
import ViewAnswersPage from "./pages/ViewAnswersPage";
import PartReportPage from "./pages/PartReportPage";
import FinalReportPage from "./pages/FinalReportPage";

// 간단 인증 가드
const RequireAuth = ({ children }) => {
  const isAuthed = !!localStorage.getItem("auth") || !!localStorage.getItem("userId");
  return isAuthed ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 인증 필요한 라우트 */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/couple"
        element={
          <RequireAuth>
            <CoupleConnectPage />
          </RequireAuth>
        }
      />
      <Route
        path="/question"
        element={
          <RequireAuth>
            <QuestionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/survey"
        element={
          <RequireAuth>
            <InitialSurveyPage />
          </RequireAuth>
        }
      />

      {/* 서로의 답변 보기 (기존 /report 대체) */}
      <Route
        path="/answers"
        element={
          <RequireAuth>
            <ViewAnswersPage />
          </RequireAuth>
        }
      />
      {/* 하위 호환: /report → /answers */}
      <Route path="/report" element={<Navigate to="/answers" replace />} />

      {/* 보고서 페이지들 */}
      {/* ✅ 동적 라우트 추가: /part/:day (HomePage의 navigate(`/part/${day}`)와 일치) */}
      <Route
        path="/part/:day"
        element={
          <RequireAuth>
            <PartReportPage />
          </RequireAuth>
        }
      />
      {/* 호환: /part-report?day=7 형태도 가능 (PartReportPage가 query/day 상태 모두 지원) */}
      <Route
        path="/part-report"
        element={
          <RequireAuth>
            <PartReportPage />
          </RequireAuth>
        }
      />
      <Route
        path="/final-report"
        element={
          <RequireAuth>
            <FinalReportPage />
          </RequireAuth>
        }
      />

      {/* 404 → 랜딩으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
