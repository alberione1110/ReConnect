import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './HomePage.css';

const LS_KEY_STATE = 'coupleQA_state';            // DiaryPage에서 사용한 동일 키
const LS_KEY_PARTICIPANT = 'coupleQA_participant'; // A/B
const DEFAULT_PARTICIPANT = 'A';

function ymd(dateObj) {
  return dateObj.toISOString().split('T')[0];
}
function addDays(ymdStr, d) {
  const dt = new Date(ymdStr + 'T00:00:00');
  dt.setDate(dt.getDate() + d);
  return ymd(dt);
}

const HomePage = () => {
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const participant = useMemo(
    () => localStorage.getItem(LS_KEY_PARTICIPANT) || DEFAULT_PARTICIPANT,
    []
  );

  // 초기 로딩: localStorage 상태 없으면 /questions36.json 로드하여 저장
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = localStorage.getItem(LS_KEY_STATE);
        if (cached) {
          const parsed = JSON.parse(cached);
          // 시작일 없으면 오늘을 시작일로 세팅
          if (!parsed.programStartDate) {
            parsed.programStartDate = ymd(new Date());
            localStorage.setItem(LS_KEY_STATE, JSON.stringify(parsed));
          }
          if (mounted) {
            setProgram(parsed);
            setLoading(false);
          }
          return;
        }
        const res = await fetch('/questions36.json');
        const data = await res.json();
        if (!data.programStartDate) data.programStartDate = ymd(new Date());
        localStorage.setItem(LS_KEY_STATE, JSON.stringify(data));
        if (mounted) {
          setProgram(data);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // 오늘의 질문으로 이동
  const goToTodayQuestion = () => {
    if (!program?.programStartDate) {
      navigate('/diary');
      return;
    }
    const today = ymd(new Date());
    // DiaryPage가 받을 수 있도록 state + localStorage로 날짜 전달
    localStorage.setItem('coupleQA_forceDate', today);
    navigate('/diary', { state: { forceDate: today } });
  };

  // 내가 답변한 일차만 필터링
  const answeredList = useMemo(() => {
    if (!program?.days?.length) return [];
    return program.days
      .filter((d) => {
        const ans = d?.answers?.[participant];
        return ans && String(ans).trim() !== '';
      })
      .map((d) => {
        const preview =
          (d.answers?.[participant] || '')
            .replace(/\s+/g, ' ')
            .slice(0, 60) + (d.answers?.[participant]?.length > 60 ? '…' : '');
        const submittedAt = d.submittedAt?.[participant] || null;
        return {
          day: d.day,
          question: d.question,
          preview,
          submittedAt,
        };
      });
  }, [program, participant]);

  // 과거 답변 카드 클릭 → 해당 일차의 "질문 페이지"로 이동
  const openDay = (dayNumber) => {
    if (!program?.programStartDate) return;
    // 시작일 + (day-1) → 해당 날짜
    const targetDate = addDays(program.programStartDate, (dayNumber - 1));
    localStorage.setItem('coupleQA_forceDate', targetDate);
    navigate('/diary', { state: { forceDate: targetDate } });
  };

  return (
    <div className="home-container">
      <Header />

      <main className="main-content">
        {/* 메인 카피 (커플 36일 프로그램 톤) */}
        <h1 className="main-slogan">
          하루 한 질문, 서로의 마음이 가까워지는 36일
        </h1>
        <p className="sub-slogan">
          오늘의 질문에 답하고, 서로를 더 깊이 이해해보세요.
        </p>

        <button className="btn big" onClick={goToTodayQuestion}>
          오늘의 질문으로 가기
        </button>

        {/* 최근 질문(내가 쓴 것만) */}
        <section className="section">
          <h3 className="section-title">최근 질문</h3>

          {loading ? (
            <div className="empty-hint">불러오는 중…</div>
          ) : answeredList.length === 0 ? (
            <div className="empty-hint">아직 작성한 답변이 없어요. 오늘의 질문부터 시작해볼까요?</div>
          ) : (
            <div className="favorite-scroll-container">
              {/* 최신순: 뒤쪽(큰 day) 먼저 보이게 정렬 */}
              {answeredList
                .slice()
                .sort((a, b) => b.day - a.day)
                .map((item) => (
                  <div
                    key={item.day}
                    className="favorite-item q-card"
                    onClick={() => openDay(item.day)}
                    title={`DAY ${item.day} 이동`}
                  >
                    <div className="day-chip">DAY {item.day}</div>
                    <div className="q-title" title={item.question}>{item.question}</div>
                    <div className="q-preview" title={item.preview}>{item.preview}</div>
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

        {/* 과거 일기 섹션/캘린더는 제거 */}
      </main>
    </div>
  );
};

export default HomePage;
