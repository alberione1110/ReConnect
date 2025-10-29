// src/pages/QuestionPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import {
  getDiaryDaily,
  submitDiary,
  getUser,
} from "../services/reconnect";
import "./QuestionPage.css";

/** BMP 이외(서로게이트 페어) 제거 + 제어문자 정리 */
function sanitizeInput(str = "", max = 1000) {
  let s = String(str);
  s = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ""); // 이모지 제거
  s = s.replace(/[\u0000-\u001F\u007F\u0080-\u009F]/g, " "); // 제어문자 제거
  if (s.length > max) s = s.slice(0, max);
  return s.replace(/\s{3,}/g, " ").trim();
}

const MAX_Q = 36;

const QuestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(null);
  const [answer, setAnswer] = useState("");

  const userIdLS = localStorage.getItem("userId") ?? "";
  const coupleCodeLS = localStorage.getItem("coupleCode") ?? "";

  // 질문 텍스트 로드
  const loadQuestionText = async (qNum) => {
    const res = await fetch("/questions36.json", { cache: "no-cache" });
    const qData = await res.json();
    const qList = Array.isArray(qData)
      ? qData
      : Array.isArray(qData?.days)
      ? qData.days.map((d) => ({
          id: d.day ?? d.id,
          question: d.question ?? d.text,
        }))
      : [];
    const qText =
      qList.find((q) => Number(q.id) === Number(qNum))?.question ||
      `질문 #${qNum}`;
    setQuestion(qText);
  };

  // 내가 작성한 마지막 질문 번호 찾기
  const findMyNextQuestion = async (uid, cc) => {
    let lastMy = 0;
    for (let i = 1; i <= MAX_Q; i++) {
      try {
        const { data } = await getDiaryDaily(uid, cc, i);
        if (data?.content) lastMy = i;
        else break;
      } catch {
        break;
      }
    }
    return Math.min(MAX_Q, lastMy + 1);
  };

  // 특정 문항의 내 기존 답변 로드
  const loadMyAnswerIfAny = async (uid, cc, qNum) => {
    try {
      const { data } = await getDiaryDaily(uid, cc, qNum);
      const content = (data?.content ?? "").toString().trim();
      setAnswer(content || "");
    } catch {
      setAnswer("");
    }
  };

  // 초기 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 세션/커플코드 확인
        if (!userIdLS) {
          navigate("/login", { replace: true });
          return;
        }
        const me = await getUser(userIdLS).then((r) => r.data).catch(() => null);
        if (!me) {
          navigate("/login", { replace: true });
          return;
        }
        const coupleCode = me?.coupleCode || coupleCodeLS;
        if (!coupleCode) {
          navigate("/couple", { replace: true });
          return;
        }
        if (coupleCode !== coupleCodeLS) {
          localStorage.setItem("coupleCode", coupleCode);
        }

        // 질문 번호 결정: state → (없으면) 내 next 계산
        let qNum = location?.state?.questionNumber || null;
        if (!qNum) {
          qNum = await findMyNextQuestion(userIdLS, coupleCode);
        }
        if (!alive) return;
        setQuestionNumber(qNum);

        await loadQuestionText(qNum);
        await loadMyAnswerIfAny(userIdLS, coupleCode, qNum);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [location, userIdLS, coupleCodeLS, navigate]);

  const handleSubmit = async () => {
    const raw = (answer ?? "").trim();
    if (!raw) {
      alert("내용을 입력하세요.");
      return;
    }
    const sanitized = sanitizeInput(raw, 800);
    const qn = Number(questionNumber);

    if (!userIdLS || !Number.isInteger(qn) || qn <= 0) {
      alert("세션 정보가 올바르지 않습니다. 다시 로그인 해주세요.");
      return;
    }

    try {
      // 사용자/커플코드 재확인
      const me = await getUser(userIdLS).then((r) => r.data).catch(() => null);
      if (!me) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        return navigate("/login", { replace: true });
      }
      const coupleCode = me.coupleCode || "";
      const partnerId = me.partnerId || me.partner_id || "";
      if (!coupleCode) {
        alert("커플 등록이 필요합니다.");
        return navigate("/couple", { replace: true });
      }
      if (coupleCode !== coupleCodeLS) {
        localStorage.setItem("coupleCode", coupleCode);
      }

      // 제출
      await submitDiary({ questionNumber: qn, content: sanitized });

      // 파트너 완료 여부 확인
      let partnerDone = false;
      if (partnerId) {
        try {
          const p = await getDiaryDaily(partnerId, coupleCode, qn);
          partnerDone = !!(p?.data?.content);
        } catch {
          partnerDone = false;
        }
      }

      if (partnerDone) {
        alert("제출되었습니다! 두 분 모두 완료했어요. 서로의 답변 페이지로 이동합니다.");
        navigate(`/answers?q=${encodeURIComponent(qn)}`, {
          state: { qIndex: qn - 1 },
          replace: true,
        });
      } else {
        alert("제출되었습니다! 홈으로 이동합니다.");
        navigate("/home", { replace: true });
      }
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      console.error("[SUBMIT /diary/submit ERROR]", { status, data });

      try {
        const me = await getUser(userIdLS).then((r) => r.data).catch(() => null);
        const cc = me?.coupleCode || coupleCodeLS || "";
        if (cc) {
          const check = await getDiaryDaily(userIdLS, cc, qn);
          const saved = (check?.data?.content ?? "").toString().trim();
          if (saved) {
            alert("제출은 완료되었지만 응답 처리 중 오류가 있었습니다. 홈으로 이동합니다.");
            return navigate("/home", { replace: true });
          }
        }
      } catch { /* ignore */ }

      const serverMsg =
        typeof e?.response?.data === "string"
          ? e.response.data
          : e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            "제출 중 오류가 발생했습니다.";
      alert(`제출 실패: ${serverMsg}\n(이모지/특수문자 제거 및 길이 제한 적용됨)`);
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
          placeholder="오늘의 답변을 작성하세요. (이모지 자동제거, 최대 800자)"
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
