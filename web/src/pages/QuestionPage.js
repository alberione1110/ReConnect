// src/pages/QuestionPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import {
  getNextQuestionNumberSafe,
  getDiaryDaily,
  submitDiary,
} from "../services/reconnect";
import "./QuestionPage.css";

const QuestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(null);
  const [answer, setAnswer] = useState("");

  const userId = localStorage.getItem("userId") || "";
  const coupleCode = localStorage.getItem("coupleCode") || "";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        let qNum = location?.state?.questionNumber || null;
        if (!qNum && coupleCode) {
          qNum = await getNextQuestionNumberSafe(coupleCode);
        }
        if (!alive) return;
        setQuestionNumber(qNum);

        const res = await fetch("/questions36.json", { cache: "no-cache" });
        const qData = await res.json();
        const qList = Array.isArray(qData)
          ? qData
          : Array.isArray(qData?.days)
          ? qData.days.map((d) => ({ id: d.day, question: d.question }))
          : [];
        const qText =
          qList.find((q) => Number(q.id) === Number(qNum))?.question ||
          `질문 #${qNum}`;
        setQuestion(qText);

        if (userId && coupleCode) {
          try {
            const { data } = await getDiaryDaily(userId, coupleCode, qNum);
            const content = (data?.content ?? "").toString().trim();
            if (content) setAnswer(content);
          } catch {}
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [location, userId, coupleCode]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert("내용을 입력하세요.");
      return;
    }
    try {
      await submitDiary({
        userId,
        coupleCode,
        questionNumber,
        content: answer.trim(),
      });
      alert("답변이 성공적으로 제출되었습니다!");
      navigate("/home");
    } catch {
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  const handleTempSave = () => {
    localStorage.setItem(
      `temp_answer_${questionNumber}`,
      JSON.stringify({ content: answer, date: new Date().toISOString() })
    );
    alert("임시 저장되었습니다.");
  };

  if (loading) {
    return (
      <div className="diary-container">
        <Header />
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="diary-container">
      <Header />
      <h2 className="subtitle">하루 한 질문, 우리를 더 가깝게.</h2>

      <div className="question-form">
        <div className="question-box">
          <div className="day-chip">DAY {questionNumber}</div>
          <h1 className="question-text">{question}</h1>
        </div>

        <textarea
          className="answer-textarea"
          placeholder="오늘의 답변을 작성하세요."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="button-group">
          <button className="btn temp" onClick={handleTempSave}>
            임시저장
          </button>
          <button className="btn submit" onClick={handleSubmit}>
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
