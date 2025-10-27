// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getNextQuestionNumberSafe,
  getDiaryDaily,
  getMySurveySafe,
} from "../services/reconnect";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [surveyCompleted, setSurveyCompleted] = useState(
    localStorage.getItem("surveyCompleted") === "true"
  );

  const userId = localStorage.getItem("userId");
  const coupleCode = localStorage.getItem("coupleCode");

  // ✅ 설문 완료 여부 + 오늘의 질문/최근 답변 불러오기
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 설문 완료 여부: 백엔드 기준 우선
        let done = false;
        try {
          const data = await getMySurveySafe();
          done = !!data;
        } catch { /* 네트워크 오류면 로컬 캐시 그대로 사용 */ }

        if (!done && localStorage.getItem("surveyCompleted") === "true") {
          done = true;
        }
        if (!alive) return;
        setSurveyCompleted(done);

        // 설문 미완료면 다음 질문/최근답변은 로딩하지 않음
        if (!done || !userId || !coupleCode) {
          setLoading(false);
          return;
        }

        const qNum = await getNextQuestionNumberSafe(coupleCode);
        if (!alive) return;
        setNextQuestion(qNum);

        // 최근 5개
        const answers = [];
        for (let i = Math.max(1, qNum - 5); i < qNum; i++) {
          try {
            const { data } = await getDiaryDaily(userId, coupleCode, i);
            if (data?.content) {
              answers.push({
                day: i,
                content: data.content,
                submittedAt: data.submittedAt,
              });
            }
          } catch {}
        }
        setRecentAnswers(answers.reverse());
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId, coupleCode]);

  const handlePrimary = () => {
    if (!surveyCompleted) {
      navigate("/survey");
    } else {
      navigate("/question");
    }
  };

  const primaryLabel = !surveyCompleted
    ? "초기 설문 시작하기"
    : nextQuestion
    ? `오늘의 질문 (DAY ${nextQuestion})`
    : "오늘의 질문 불러오는 중...";

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <h1 className="main-slogan">
          하루 한 질문, 서로의 마음이 가까워지는 36일
        </h1>
        <p className="sub-slogan">
          {surveyCompleted
            ? "오늘의 질문에 답하고, 서로를 더 깊이 이해해보세요."
            : "먼저 초기 설문으로 현재 성향을 알아봐요."}
        </p>

        <button
          className="btn big"
          onClick={handlePrimary}
          disabled={!userId || !coupleCode}
        >
          {primaryLabel}
        </button>

        {surveyCompleted && (
          <section className="section">
            <h3 className="section-title">최근 답변</h3>
            {loading ? (
              <p className="empty-hint">불러오는 중...</p>
            ) : recentAnswers.length === 0 ? (
              <p className="empty-hint">아직 답변이 없습니다.</p>
            ) : (
              <div className="answer-list">
                {recentAnswers.map((ans) => (
                  <div key={ans.day} className="answer-item">
                    <div className="day-chip">DAY {ans.day}</div>
                    <p className="preview">
                      {ans.content.slice(0, 50)}
                      {ans.content.length > 50 && "..."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;
