// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getDiaryDaily, getMySurveySafe, getUser } from "../services/reconnect";
import "./HomePage.css";

const MAX_Q = 36;

const HomePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [surveyCompleted, setSurveyCompleted] = useState(
    localStorage.getItem("surveyCompleted") === "true"
  );
  const [nextQuestion, setNextQuestion] = useState(1);
  const [bothAllDone, setBothAllDone] = useState(false);

  const [history, setHistory] = useState([]); // [{day, question, myContent, partnerDone, submittedAt}]
  const [questions, setQuestions] = useState([]); // [{id, question}]

  const userId = localStorage.getItem("userId") || "";
  const coupleCodeLS = localStorage.getItem("coupleCode") || "";

  const loadQuestionTextAll = async () => {
    const res = await fetch("/questions36.json", { cache: "no-cache" });
    const qData = await res.json();
    const qList = Array.isArray(qData)
      ? qData
      : Array.isArray(qData?.days)
      ? qData.days.map((d) => ({
          id: Number(d.day ?? d.id),
          question: d.question ?? d.text,
        }))
      : [];
    qList.sort((a, b) => Number(a.id) - Number(b.id));
    return qList;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        if (!userId) {
          navigate("/login", { replace: true });
          return;
        }

        const me = await getUser(userId).then((r) => r.data).catch(() => null);
        if (!me) {
          navigate("/login", { replace: true });
          return;
        }
        const coupleCode = me?.coupleCode || "";
        const partnerId = me?.partnerId || me?.partner_id || "";
        if (!coupleCode) {
          navigate("/couple", { replace: true });
          return;
        }
        if (coupleCode !== coupleCodeLS) {
          localStorage.setItem("coupleCode", coupleCode);
        }

        let done = false;
        try {
          const data = await getMySurveySafe();
          done = !!data;
        } catch {}
        if (!done && localStorage.getItem("surveyCompleted") === "true") done = true;
        if (!alive) return;
        setSurveyCompleted(done);

        const qList = await loadQuestionTextAll();
        if (!alive) return;
        setQuestions(qList);

        if (!done) {
          setNextQuestion(1);
          setHistory([]);
          setBothAllDone(false);
          return;
        }

        let lastMy = 0, lastPartner = 0;
        const days = Array.from({ length: MAX_Q }, (_, i) => i + 1);

        const myAll = await Promise.all(
          days.map(async (day) => {
            try {
              const { data } = await getDiaryDaily(userId, coupleCode, day);
              const content = (data?.content ?? "").toString();
              const submittedAt = data?.submittedAt || null;
              if (content) lastMy = Math.max(lastMy, day);
              return { day, myContent: content, submittedAt };
            } catch {
              return { day, myContent: "", submittedAt: null };
            }
          })
        );

        const partnerAll = await Promise.all(
          days.map(async (day) => {
            if (!partnerId) return { day, partnerDone: false };
            try {
              const { data } = await getDiaryDaily(partnerId, coupleCode, day);
              const has = !!(data?.content);
              if (has) lastPartner = Math.max(lastPartner, day);
              return { day, partnerDone: has };
            } catch {
              return { day, partnerDone: false };
            }
          })
        );

        const merged = days.map((day) => {
          const mine = myAll.find((x) => x.day === day);
          const partner = partnerAll.find((x) => x.day === day);
          const qText =
            qList.find((q) => Number(q.id) === Number(day))?.question ||
            `질문 #${day}`;
          return {
            day,
            question: qText,
            myContent: mine?.myContent || "",
            submittedAt: mine?.submittedAt || null,
            partnerDone: !!partner?.partnerDone,
          };
        });

        if (!alive) return;

        const nextQ = Math.min(MAX_Q, lastMy + 1);
        setNextQuestion(nextQ);
        setBothAllDone(lastMy >= MAX_Q && lastPartner >= MAX_Q);
        setHistory(merged);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [navigate, userId, coupleCodeLS]);

  const handleGoFinalReport = () => navigate("/final-report");

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <h1 className="main-slogan">하나씩 답하면, 곧바로 다음 질문으로</h1>
        <p className="sub-slogan">
          파트너와 함께 36문항을 마치면 최종 보고서를 볼 수 있어요.
        </p>

        <div className="cta-row">
          <button className="btn big" onClick={handleGoFinalReport} disabled={!userId}>
            최종 보고서 바로가기
          </button>
        </div>

        {surveyCompleted && (
          <section className="history-layout">
            <aside className="history-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-title">빠른 이동</div>
                <div className="chips">
                  {Array.from({ length: MAX_Q }, (_, i) => i + 1).map((d) => (
                    <a key={d} href={`#day-${d}`} className="chip">DAY {d}</a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="history-content">
              {loading ? (
                <p className="empty-hint">불러오는 중...</p>
              ) : history.length === 0 ? (
                <p className="empty-hint">답변 이력이 없습니다.</p>
              ) : (
                <div className="answer-list grid">
                  {history.map((item) => (
                    <div key={item.day} id={`day-${item.day}`} className="answer-item q-card">
                      <div className="day-chip">DAY {item.day}</div>
                      <div className="q-title">{item.question}</div>
                      <p className="preview">
                        {item.myContent ? item.myContent.slice(0, 80) : "(내 답변 없음)"}
                        {item.myContent && item.myContent.length > 80 && "..."}
                      </p>
                      <div className="q-meta-row">
                        {item.partnerDone ? (
                          <span className="badge good">상대 완료</span>
                        ) : (
                          <span className="badge wait">상대 대기</span>
                        )}
                        <div className="spacer" />
                        <button
                          className="btn small"
                          onClick={() => navigate(`/part/${item.day}`)}
                          title="이 문항의 보고서 보기"
                        >
                          문항별 보고서
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;
