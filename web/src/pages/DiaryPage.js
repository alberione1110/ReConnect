import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './DiaryPage.css';

// 로컬 키
const LS_KEY_STATE = 'coupleQA_state'; // 전체 진행 상태(questions36.json 병합본)

// 내부 임시 참가자 키(추후 연동 전까지 단일 사용자 저장용)
const PARTICIPANT_KEY = 'A';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function dateToYMD(dateObj) {
  return dateObj.toISOString().split('T')[0];
}

function diffDays(aYmd, bYmd) {
  const a = new Date(aYmd + 'T00:00:00');
  const b = new Date(bYmd + 'T00:00:00');
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const DiaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const todayStr = useMemo(() => dateToYMD(new Date()), []);
  const [date, setDate] = useState(todayStr);

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  // 홈에서 전달된 forceDate 적용
  useEffect(() => {
    const st = location?.state;
    const byState = st?.forceDate;
    const byLS = localStorage.getItem('coupleQA_forceDate');
    const useDate = byState || byLS;
    if (useDate) {
      setDate(useDate);
      localStorage.removeItem('coupleQA_forceDate');
    }
  }, [location]);

  // 현재 일차 계산
  const currentDayIndex = useMemo(() => {
    if (!program?.programStartDate) return 0;
    const delta = diffDays(date, program.programStartDate);
    return clamp(delta, 0, 35); // 0~35 (총 36일)
  }, [date, program]);

  const currentDayObj = program?.days?.[currentDayIndex] || null;

  const [answer, setAnswer] = useState('');

  // 초기 로딩
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = localStorage.getItem(LS_KEY_STATE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!parsed.programStartDate) parsed.programStartDate = todayStr;
          if (mounted) {
            setProgram(parsed);
            setLoading(false);
          }
          return;
        }
        const res = await fetch('/questions36.json');
        const data = await res.json();
        if (!data.programStartDate) data.programStartDate = todayStr;
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
  }, [todayStr]);

  // 답안 로딩 (단일 사용자 -> A 키에 저장/조회)
  useEffect(() => {
    if (!program || !currentDayObj) return;
    const saved = currentDayObj.answers?.[PARTICIPANT_KEY] ?? '';
    setAnswer(saved || '');
  }, [program, currentDayObj]);

  const persistProgram = (nextProgram) => {
    setProgram(nextProgram);
    localStorage.setItem(LS_KEY_STATE, JSON.stringify(nextProgram));
  };

  const handleTempSave = () => {
    if (!program || !currentDayObj) return;
    const next = { ...program };
    const dayObj = { ...currentDayObj };
    const dayIdx = currentDayIndex;

    dayObj.answers = {
      ...(dayObj.answers || {}),
      [PARTICIPANT_KEY]: answer,
    };
    dayObj.submittedAt = {
      ...(dayObj.submittedAt || {}),
      [PARTICIPANT_KEY]: new Date().toISOString(),
    };

    next.days = [...next.days];
    next.days[dayIdx] = dayObj;

    persistProgram(next);
    alert('임시저장 되었습니다.');
  };

  const handleSubmit = () => {
    if (!program || !currentDayObj) return;

    const next = { ...program };
    const dayObj = { ...currentDayObj };
    const dayIdx = currentDayIndex;

    // 저장
    dayObj.answers = {
      ...(dayObj.answers || {}),
      [PARTICIPANT_KEY]: answer,
    };
    dayObj.submittedAt = {
      ...(dayObj.submittedAt || {}),
      [PARTICIPANT_KEY]: new Date().toISOString(),
    };

    // (미래 연동 대비) A와 B가 모두 있으면 completed
    const a = dayObj.answers?.A;
    const b = dayObj.answers?.B;
    if (a && a.trim() !== '' && b && b.trim() !== '') {
      dayObj.completed = true;
    }

    next.days = [...next.days];
    next.days[dayIdx] = dayObj;
    persistProgram(next);

    const dayNumber = dayObj.day || dayIdx + 1;
    navigate(`/report?day=${dayNumber}`);
  };

  if (loading) {
    return (
      <div className="diary-container">
        <Header showAuthButtons={false} />
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="diary-container">
      <Header showAuthButtons={false} />
      {/* 상단 문구 변경 */}
      <h2 className="subtitle">하루 한 질문, 우리를 더 가깝게.</h2>

      {/* 질문 + 답변 */}
      <div className="question-form">
        <div className="question-box">
          <div className="day-chip">DAY {currentDayObj?.day || currentDayIndex + 1}</div>
          <h1 className="question-text">
            {currentDayObj?.question || '오늘의 질문을 불러오지 못했습니다.'}
          </h1>
          {currentDayObj?.tags?.length ? (
            <div className="tag-row">
              {currentDayObj.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          ) : null}
        </div>

        <textarea
          className="answer-textarea"
          placeholder="여기에 오늘의 답변을 작성하세요."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="button-group">
          <button className="btn temp" onClick={handleTempSave}>임시저장</button>
          <button className="btn submit" onClick={handleSubmit}>제출하기</button>
        </div>

        <div className="program-info">
          시작일: <b>{program?.programStartDate}</b> • 현재 <b>{currentDayObj?.day || currentDayIndex + 1}일차</b>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
