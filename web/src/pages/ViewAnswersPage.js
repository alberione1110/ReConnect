// src/pages/ViewAnswersPage.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./ViewAnswersPage.css"; // 기존 스타일 재사용

import {
  getDiaryDaily,
  getPartnerDiaryOnce,
  getUser,
} from "../services/reconnect";

/** URL ?q= 로 들어온 값을 0/1 기반 모두 허용해서 DAY 번호(1..36)로 반환 */
function useDayNumber(defaultTotal = 36) {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const byQuery = qs.get("q");
  const byState = location.state?.qIndex;

  let idx = Number.isFinite(Number(byQuery))
    ? Number(byQuery)
    : Number.isFinite(Number(byState))
    ? Number(byState)
    : 0;

  // 1-based → 그대로 day, 0-based → +1 보정
  let day;
  if (idx >= 1 && idx <= defaultTotal) day = idx;
  else day = Number(idx) + 1;

  if (!Number.isInteger(day) || day < 1) day = 1;
  if (day > defaultTotal) day = defaultTotal;
  return day;
}

const ViewAnswersPage = () => {
  // 상태
  const [phase, setPhase] = useState("loading"); // 'loading' | 'need-mine' | 'waiting-partner' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  // 원문 (백엔드에서 가져온 내/상대 답변)
  const [myAnswer, setMyAnswer] = useState("");
  const [partnerAnswer, setPartnerAnswer] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);

  const userIdLS = localStorage.getItem("userId") || "";
  const coupleCodeLS = localStorage.getItem("coupleCode") || "";
  const dayNumber = useDayNumber(36); // DAY(1..36)

  // 세션/커플코드 확인 → 내/상대 답변 확인
  useEffect(() => {
    mountedRef.current = true;
    setPhase("loading");
    setErrorMsg("");
    setMyAnswer("");
    setPartnerAnswer("");

    (async () => {
      try {
        // (1) 사용자 확인 (세션 + 최신 coupleCode 동기화)
        const me = await getUser(userIdLS).then(r => r.data).catch(() => null);
        if (!mountedRef.current) return;

        if (!me) {
          setPhase("error");
          setErrorMsg("로그인이 필요합니다.");
          return;
        }
        const coupleCodeFromDB = me.coupleCode || "";
        if (!coupleCodeFromDB) {
          setPhase("error");
          setErrorMsg("커플 등록이 필요합니다.");
          return;
        }
        if (coupleCodeFromDB !== coupleCodeLS) {
          localStorage.setItem("coupleCode", coupleCodeFromDB);
        }

        // (2) 내 답변
        try {
          const myRes = await getDiaryDaily(me.userId, coupleCodeFromDB, dayNumber);
          const my = (myRes?.data?.content ?? "").toString().trim();
          if (!mountedRef.current) return;
          if (!my) {
            setPhase("need-mine");
            return;
          }
          setMyAnswer(my);
        } catch (e) {
          if (!mountedRef.current) return;
          if (e?.response?.status === 400) {
            setPhase("need-mine");
            return;
          }
          setPhase("error");
          setErrorMsg("내 답변을 조회하는 중 오류가 발생했습니다.");
          return;
        }

        // (3) 파트너 답변 (세션 기준 파트너)
        try {
          const p = await getPartnerDiaryOnce(dayNumber);
          const partner = (p?.data?.content ?? "").toString().trim();
          if (!mountedRef.current) return;
          if (!partner) {
            setPhase("waiting-partner");
            return;
          }
          setPartnerAnswer(partner);
        } catch (e) {
          if (!mountedRef.current) return;
          if (e?.response?.status === 400) {
            setPhase("waiting-partner");
            return;
          }
          if (e?.response?.status === 401) {
            setPhase("error");
            setErrorMsg("로그인이 필요합니다.");
            return;
          }
          setPhase("error");
          setErrorMsg("상대 답변 조회 중 오류가 발생했습니다.");
          return;
        }

        // (4) 둘 다 작성 완료 → 준비 완료
        setPhase("ready");
      } catch (e) {
        if (!mountedRef.current) return;
        setPhase("error");
        setErrorMsg("알 수 없는 오류가 발생했습니다.");
      }
    })();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, userIdLS, coupleCodeLS, dayNumber]);

  /* --------- 뷰 --------- */

  const LoadingView = () => (
    <div className="report-box">
      <div className="report-content-wrapper">
        <div className="status-box"><h3>불러오는 중...</h3></div>
      </div>
    </div>
  );

  const NeedMineView = () => (
    <div className="report-box">
      <div className="report-content-wrapper">
        <div className="status-box">
          <h3>먼저 나의 답변을 작성해주세요</h3>
          <p>이 DAY({dayNumber})에 대한 내 답변이 아직 없습니다.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => navigate("/question", { state: { questionNumber: dayNumber }, replace: true })}>
              질문 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const WaitingPartner = () => (
    <div className="report-box">
      <div className="report-content-wrapper">
        <div className="status-box">
          <h3>상대의 답변을 기다리고 있어요</h3>
          <p>상대가 DAY {dayNumber}에 답변하면 서로의 답변을 함께 볼 수 있어요.</p>
        </div>
        <div className="answer-box">
          <div className="answer-item"><strong>나의 답변</strong><br />{myAnswer || "(아직 없음)"}</div>
          <div className="answer-item"><strong>상대의 답변</strong><br />(미작성)</div>
        </div>
      </div>
    </div>
  );

  const ErrorView = () => (
    <div className="report-box">
      <div className="report-content-wrapper">
        <div className="status-box error">
          <h3>문제가 발생했어요</h3>
          <p>{errorMsg || "알 수 없는 오류입니다."}</p>
          {errorMsg?.includes("로그인") && (
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => navigate("/login", { replace: true })}>
                로그인 페이지로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ReadyView = () => (
    <div className="report-box">
      <div className="report-content-wrapper">
        <div className="report-header">
          <div className="report-title">서로의 답변 (DAY {dayNumber})</div>
        </div>

        {/* 원문 답변 */}
        <div className="answer-box">
          <div className="answer-item"><strong>나의 답변</strong><br />{myAnswer || "(비어 있음)"}</div>
          <div className="answer-item"><strong>상대의 답변</strong><br />{partnerAnswer || "(비어 있음)"}</div>
        </div>

        {/* 뒤로가기 */}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn" onClick={() => navigate("/home")}>홈으로</button>
        </div>
      </div>
    </div>
  );

  /* --------- 렌더 --------- */
  return (
    <div className="report-container">
      <Header showAuthButtons={false} />
      {phase === "loading" && <LoadingView />}
      {phase === "need-mine" && <NeedMineView />}
      {phase === "waiting-partner" && <WaitingPartner />}
      {phase === "error" && <ErrorView />}
      {phase === "ready" && <ReadyView />}
    </div>
  );
};

export default ViewAnswersPage;
