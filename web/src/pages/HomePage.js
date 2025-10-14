import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getNextQuestionNumber, getDiaryDaily } from "../services/reconnect";
import "./HomePage.css";

const LS_COUPLE = "coupleCode";

const HomePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [coupleCode, setCoupleCode] = useState(
    localStorage.getItem(LS_COUPLE) || ""
  );
  const [nextQ, setNextQ] = useState(null);
  const [recent, setRecent] = useState([]);

  const userId = useMemo(() => localStorage.getItem("userId") || "", []);

  // 📘 질문 텍스트 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/questions36.json", { cache: "no-cache" });
        const data = await res.json();
        if (!alive) return;
        if (Array.isArray(data)) {
          setQuestions(data);
        } else if (Array.isArray(data?.days)) {
          setQuestions(
            data.days.map((d) => ({ id: d.day, question: d.question }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 📘 다음 질문 번호 + 최근 답변 불러오기
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId || !coupleCode) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data: nextData } = await getNextQuestionNumber(coupleCode);
        const nextNumber = nextData?.nextQuestionNumber ?? 1;
        if (!alive) return;
        setNextQ(nextNumber);

        const toCheck = [];
        for (let q = Math.max(1, nextNumber - 8); q < nextNumber; q++) {
          toCheck.push(q);
        }
        toCheck.reverse();

        const items = [];
        for (const qNum of toCheck) {
          try {
            const { data } = await getDiaryDaily(userId, coupleCode, qNum);
            const content = (data?.content ?? "").toString().trim();
            if (content) {
              const qt =
                questions.find((x) => Number(x.id) === Number(qNum))?.question ||
                `질문 #${qNum}`;
              const preview =
                content.replace(/\s+/g, " ").slice(0, 60) +
                (content.length > 60 ? "…" : "");
              items.push({
                day: qNum,
                question: qt,
                preview,
                submittedAt: data?.submittedAt || null,
              });
            }
          } catch {
            /* no-op */
          }
        }
        if (!alive) return;
        setRecent(items.sort((a, b) => b.day - a.day));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [userId, coupleCode, questions]);

  // 📘 오늘의 질문으로 이동
  const goToTodayQuestion = () => {
    navigate("/question");
  };

  // 📘 특정 문항 열기
  const openDay = (dayNumber) => {
    navigate("/question", { state: { questionNumber: dayNumber } });
  };

  // 📘 커플 코드 입력
  const onChangeCouple = (e) => {
    const v = e.target.value.trim();
    setCoupleCode(v);
    localStorage.setItem(LS_COUPLE, v);
  };

  return (
    <div className="home-container">
      <Header />

      <main className="main-content">
        <h1 className="main-slogan">
          하루 한 질문, 서로의 마음이 가까워지는 36일
        </h1>
        <p className="sub-slogan">
          오늘의 질문에 답하고, 서로를 더 깊이 이해해보세요.
        </p>

        <div style={{ marginBottom: 12 }}>
          <input
            value={coupleCode}
            onChange={onChangeCouple}
            placeholder="커플 코드"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #cdb6a4",
              background: "#fff",
              minWidth: 180,
              textAlign: "center",
            }}
          />
        </div>

        <button
          className="btn big"
          onClick={goToTodayQuestion}
          disabled={!coupleCode}
        >
          {nextQ
            ? `오늘의 질문으로 가기 (다음: #${nextQ})`
            : "오늘의 질문으로 가기"}
        </button>

        <section className="section">
          <h3 className="section-title">최근 질문</h3>

          {loading ? (
            <div className="empty-hint">불러오는 중…</div>
          ) : recent.length === 0 ? (
            <div className="empty-hint">
              아직 작성한 답변이 없어요. 오늘의 질문부터 시작해볼까요?
            </div>
          ) : (
            <div className="favorite-scroll-container">
              {recent.map((item) => (
                <div
                  key={item.day}
                  className="favorite-item q-card"
                  onClick={() => openDay(item.day)}
                  title={`DAY ${item.day} 이동`}
                >
                  <div className="day-chip">DAY {item.day}</div>
                  <div className="q-title" title={item.question}>
                    {item.question}
                  </div>
                  <div className="q-preview" title={item.preview}>
                    {item.preview}
                  </div>
                  {item.submittedAt ? (
                    <div className="q-meta">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
