import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import {
  getNextQuestionNumber,
  getDiaryDaily,
  submitDiary,
} from "../services/reconnect";
import "./QuestionPage.css"; // ✅ 파일명 수정

const QuestionPage = () => { // ✅ 컴포넌트명 변경
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(null);
  const [answer, setAnswer] = useState("");

  const userId = localStorage.getItem("userId") || "";
  const coupleCode = localStorage.getItem("coupleCode") || "";

  // 1️⃣ 오늘 혹은 state에서 questionNumber 가져오기
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        let qNum = location?.state?.questionNumber || null;

        if (!qNum && coupleCode) {
          const { data } = await getNextQuestionNumber(coupleCode);
          qNum = data?.nextQuestionNumber ?? 1;
        }

        if (!alive) return;
        setQuestionNumber(qNum);

        // 질문 텍스트 로드
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

        // 이미 작성된 답변 불러오기
        if (userId && coupleCode) {
          try {
            const { data } = await getDiaryDaily(userId, coupleCode, qNum);
            const content = (data?.content ?? "").toString().trim();
            if (content) setAnswer(content);
          } catch {
            /* 작성 전이면 무시 */
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [location, userId, coupleCode]);

  // 2️⃣ 제출
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
    } catch (err) {
      console.error(err);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  // 3️⃣ 임시 저장 (로컬 전용)
  const handleTempSave = () => {
    localStorage.setItem(
      `temp_answer_${questionNumber}`,
      JSON.stringify({
        content: answer,
        date: new Date().toISOString(),
      })
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

export default QuestionPage; // ✅ export 수정
