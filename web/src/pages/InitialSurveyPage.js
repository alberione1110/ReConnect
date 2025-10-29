import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { saveSurvey, getUser } from "../services/reconnect";
import "./InitialSurveyPage.css";

/**
 * 초기 설문 페이지 동작:
 * - public/initial_survey.json 로드
 * - 각 문항(1~36)에 대해 1~5 리커트 선택
 * - reverse 항목은 6 - value 로 점수화
 * - dimension이 "회피"/"불안"별 합계(totalAvoidance, totalAnxiety) 계산
 * - payload: q1~q36, totalAvoidance, totalAnxiety (※ camelCase!)
 * - 저장 성공 시 localStorage.surveyCompleted = "true" → /home 이동
 * - 세션/커플코드 없으면 로그인/커플 등록 페이지로 리다이렉트
 */

const Q_PATH = `${process.env.PUBLIC_URL || ""}/initial_survey.json`;

const InitialSurveyPage = () => {
  const [items, setItems] = useState([]);       // [{id, text, dimension, reverse}, ...]
  const [answers, setAnswers] = useState({});   // {1: 3, 2: 5, ...}
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const userId = localStorage.getItem("userId") || "";
  const coupleCodeLS = localStorage.getItem("coupleCode") || "";

  // 세션/커플코드 확인 + 문항 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 0) 로그인 확인
        if (!userId) {
          window.location.replace("/login");
          return;
        }

        // 1) 서버 기준 사용자 조회 (세션 유효성 + 커플코드 보유)
        const me = await getUser(userId).then((r) => r.data).catch(() => null);
        if (!me) {
          window.location.replace("/login");
          return;
        }
        const coupleCodeFromDB = me.coupleCode || "";
        if (!coupleCodeFromDB) {
          window.location.replace("/couple");
          return;
        }
        if (coupleCodeFromDB !== coupleCodeLS) {
          localStorage.setItem("coupleCode", coupleCodeFromDB);
        }

        // 2) 설문 문항 로드
        const res = await fetch(Q_PATH, { cache: "no-cache" });
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data?.items) ? data.items : [];
        if (!alive) return;
        setItems(arr);
      } catch (e) {
        setMsg("설문을 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, coupleCodeLS]);

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const allAnswered = items.length > 0 && items.every((it) => !!answers[it.id]);

  // reverse 적용 + 합산 → 백엔드 DTO 규격에 맞는 payload 생성
  const buildPayload = () => {
    let totalAvoidance = 0;
    let totalAnxiety = 0;
    const q = {}; // q1~q36

    for (const it of items) {
      const raw = Number(answers[it.id] || 0);        // 1~5
      const scored = it.reverse ? 6 - raw : raw;      // reverse 처리
      q[`q${it.id}`] = scored;

      if (it.dimension === "회피") totalAvoidance += scored;
      if (it.dimension === "불안") totalAnxiety += scored;
    }

    // 서버는 세션에서 userId/coupleCode를 세팅하므로 보내지 않아도 된다.
    return {
      ...q,
      totalAvoidance,
      totalAnxiety,
    };
  };

  const handleSubmit = async () => {
    setMsg("");
    if (busy) return;

    // 방어: 로그인/커플코드 로컬 확인 (실제 검증은 서버에서 다시 함)
    if (!userId) return setMsg("로그인이 필요합니다.");
    if (!localStorage.getItem("coupleCode")) return setMsg("커플 코드가 필요합니다.");
    if (!allAnswered) return setMsg("모든 문항에 응답해주세요.");

    try {
      setBusy(true);

      // 서버 세션 재확인
      const me = await getUser(userId).then((r) => r.data).catch(() => null);
      if (!me) {
        setMsg("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.replace("/login");
        return;
      }
      if (!me.coupleCode) {
        setMsg("커플 등록이 필요합니다.");
        window.location.replace("/couple");
        return;
      }

      const payload = buildPayload();
      await saveSurvey(payload); // POST /api/survey/save (withCredentials=true)

      localStorage.setItem("surveyCompleted", "true");
      alert("설문이 저장되었습니다. 이제 데일리 질문으로 진행하세요!");
      window.location.replace("/home");
    } catch (e) {
      const err =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "설문 저장 중 오류가 발생했습니다.";
      setMsg(err);
    } finally {
      setBusy(false);
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
                    disabled={busy}
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cta">
        <button className="btn submit" onClick={handleSubmit} disabled={!allAnswered || busy}>
          {busy ? "제출 중..." : "설문 제출"}
        </button>
      </div>
    </div>
  );
};

export default InitialSurveyPage;
