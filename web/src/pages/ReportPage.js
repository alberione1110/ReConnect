import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './ReportPage.css';
import graph from '../img/graph.png';
import coordinate from '../img/coordinate.png';

// public/questions36.json 을 안전하게 참조
const Q_URL = `${process.env.PUBLIC_URL}/questions36.json`;

function useQueryIndex(totalLen = 36) {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const byQuery = qs.get('q');        // 0-based 또는 1-based 모두 허용
  const byState = location.state?.qIndex;

  let idx = Number.isFinite(Number(byQuery))
    ? Number(byQuery)
    : (Number.isFinite(Number(byState)) ? Number(byState) : 0);

  // 1-based로 들어왔을 가능성 고려 (1~totalLen이면 0-based로 보정)
  if (idx >= 1 && idx <= totalLen) idx = idx - 1;

  // 범위 방어
  if (!Number.isInteger(idx) || idx < 0) idx = 0;
  if (idx >= totalLen) idx = totalLen - 1;
  return idx;
}

function pickQuestionText(q) {
  if (!q) return '';
  return q.text ?? q.question ?? q.title ?? String(q);
}

const ReportPage = () => {
  const [questions, setQuestions] = useState([]);   // ← JSON을 fetch해서 넣음
  const [loading, setLoading] = useState(true);

  // JSON 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(Q_URL);
        const data = await res.json();
        if (!mounted) return;

        // 배열 형태([{}, {}, ...]) 또는 {days:[...]} 둘 다 허용
        const list = Array.isArray(data) ? data : (data?.days ?? []);
        setQuestions(list);
      } catch (e) {
        console.error('questions36.json 로드 실패:', e);
        setQuestions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 질문 수를 알고 나서 qIndex 계산
  const qIndex = useQueryIndex(questions.length || 36);
  const qItem = questions[qIndex];
  const qText = pickQuestionText(qItem);
  const qNumber = qItem?.id ?? (qIndex + 1);

  if (loading) {
    return (
      <div className="report-container">
        <Header showAuthButtons={false} />
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <Header showAuthButtons={false} />

      {/* 상단 질문 배너 */}
      <div className="question-banner">
        <div className="question-number">{qNumber}.</div>
        <div className="question-text">{qText || '질문을 불러올 수 없습니다.'}</div>
      </div>

      {/* 리포트 메인 박스 */}
      <div className="report-box">
        <div className="report-content-wrapper">
          {/* 나/상대 답변 */}
          <div className="answer-box">
            <div className="answer-item">
              <strong>나의 답변</strong><br />
              나의 raw_answer 내용
            </div>
            <div className="answer-item">
              <strong>상대의 답변</strong><br />
              상대의 raw_answer 내용
            </div>
          </div>

          {/* 유형 해석 텍스트 */}
          <div className="explanation-box">
            <div className="section-title">유형 해석</div>
            <p>
              당신은 상대방과의 분리에 대해 불안감을 느끼는 경향이 있습니다.
              이는 애착 유형과 관련이 있으며, 관계에서 안정감을 확보하는 것이 도움이 됩니다.
            </p>
          </div>

          {/* 미니 그래프 + 오늘 좌표 */}
          <div className="graph-section">
            <div className="mini-graph">
              <div className="section-title">미니 추세 그래프</div>
              <img src={graph} alt="line chart" />
            </div>
            <div className="today-point">
              <div className="section-title">오늘 좌표</div>
              <img src={coordinate} alt="blended chart" />
            </div>
          </div>

          {/* 조언/팁 */}
          <div className="tips-box">
            <div className="section-title">조언 / Tips</div>
            <ul>
              <li>산책을 통해 불안을 완화하세요.</li>
              <li>상대에게 자신의 감정을 솔직하게 표현해보세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
