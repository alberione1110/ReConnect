// src/pages/InitialSurveyPage.js
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { saveSurvey } from "../services/reconnect";
import "./InitialSurveyPage.css";

/**
 * 초기 설문 페이지 동작:
 * - public/initial_survey.json 로드
 * - 각 문항(1~36)에 대해 1~5 리커트 선택
 * - reverse 항목은 6 - value 로 점수화
 * - dimension이 "회피"/"불안"별 합계(total_avoidance, total_anxiety) 계산
 * - payload: q1~q36, total_avoidance, total_anxiety, userId, coupleCode
 * - 저장 성공 시 localStorage.surveyCompleted = "true" → /home 이동
 */

const InitialSurveyPage = () => {
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({}); // {1: 3, 2: 5, ...}
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const userId = localStorage.getItem("userId") || "";
  const coupleCode = localStorage.getItem("coupleCode") || "";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/initial_survey.json", { cache: "no-cache" });
        const data = await res.json();
        const arr = Array.isArray(data?.items) ? data.items : [];
        if (!alive) return;
        setItems(arr);
      } catch (e) {
        setMsg("설문을 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const allAnswered = items.length > 0 && items.every((it) => !!answers[it.id]);

  const calcPayload = () => {
    // reverse 적용 + 합산
    let total_avoidance = 0;
    let total_anxiety = 0;

    // q1~q36 (reverse 적용된 최종 점수로 저장)
    const q = {};

    for (const it of items) {
      const raw = Number(answers[it.id] || 0);
      const scored = it.reverse ? 6 - raw : raw;

      q[`q${it.id}`] = scored;

      if (it.dimension === "회피") total_avoidance += scored;
      if (it.dimension === "불안") total_anxiety += scored;
    }

    return {
      ...q,
      total_avoidance,
      total_anxiety,
      userId,
      coupleCode,
    };
  };

  const handleSubmit = async () => {
    setMsg("");
    if (!userId) return setMsg("로그인이 필요합니다.");
    if (!coupleCode) return setMsg("커플 코드가 필요합니다.");
    if (!allAnswered) return setMsg("모든 문항에 응답해주세요.");

    try {
      const payload = calcPayload();
      await saveSurvey(payload);
      localStorage.setItem("surveyCompleted", "true"); // 프론트 캐시
      alert("설문이 저장되었습니다. 이제 데일리 질문으로 진행하세요!");
      window.location.replace("/home");
    } catch (e) {
      const err =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "설문 저장 중 오류가 발생했습니다.";
      setMsg(err);
    }
  };

  if (loading) {
    return (
      <div className="survey-container">
        <Header />
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="survey-container">
      <Header />
      <h2 className="title">초기 애착 성향 설문</h2>
      <p className="desc">각 문항에 대해 1(전혀 아니다) ~ 5(매우 그렇다)로 응답해주세요.</p>

      {msg && <div className="error" role="alert">{msg}</div>}

      <div className="survey-list">
        {items.map((it) => (
          <div key={it.id} className="survey-item">
            <div className="q-head">
              <span className="q-num">Q{it.id}.</span>
              <span className="q-text">{it.text}</span>
              <span className={`chip ${it.dimension === "회피" ? "avoid" : "anx"}`}>
                {it.dimension}{it.reverse ? " · R" : ""}
              </span>
            </div>

            <div className="likert">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="likert-opt">
                  <input
                    type="radio"
                    name={`q${it.id}`}
                    value={v}
                    checked={Number(answers[it.id] || 0) === v}
                    onChange={() => setAnswer(it.id, v)}
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cta">
        <button className="btn submit" onClick={handleSubmit} disabled={!allAnswered}>
          설문 제출
        </button>
      </div>
    </div>
  );
};

export default InitialSurveyPage;
