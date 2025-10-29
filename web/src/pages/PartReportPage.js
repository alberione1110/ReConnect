// src/pages/PartReportPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import "./Report.css";

/** /reports/와 /report/ 및 루트까지 모두 시도 (경로 혼동 대비) */
const fetchJSONRobust = async (rel) => {
  const base = process.env.PUBLIC_URL || "";
  const clean = rel.replace(/^\/+/, "");
  const candidates = [
    `${base}/reports/${clean}`,
    `${base}/report/${clean}`,
    `/reports/${clean}`,
    `/report/${clean}`,
    `${base}/${clean}`, // e.g., questions36.json at public root
    `/${clean}`,
  ];
  let lastErr = "";
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (res.ok) return await res.json();
      lastErr = `HTTP ${res.status} @ ${url}`;
    } catch (e) {
      lastErr = `${e} @ ${url}`;
    }
  }
  throw new Error(lastErr || `fail ${rel}`);
};

export default function PartReportPage() {
  // /part/:day 또는 /part?day=7 둘 다 지원
  const { day: paramDay } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryDay = new URLSearchParams(location.search).get("day");
  const stateDay = location.state?.day;
  const day = Math.max(1, Math.min(36, Number(paramDay || queryDay || stateDay || 1)));

  // question_reports.json (A/B/coach.byDay) + questions36.json (문항 제목)
  const [reportData, setReportData] = useState(null);
  const [qList, setQList] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [qr, q36] = await Promise.all([
          fetchJSONRobust("question_reports.json"),
          fetchJSONRobust("questions36.json"),
        ]);
        setReportData(qr);

        const arr = Array.isArray(q36)
          ? q36
          : Array.isArray(q36?.days)
          ? q36.days.map((d) => ({
              id: Number(d.day ?? d.id),
              question: d.question ?? d.text,
            }))
          : [];
        arr.sort((a, b) => Number(a.id) - Number(b.id));
        setQList(arr);
      } catch (e) {
        console.error(e);
        setErr(String(e.message || e));
      }
    })();
  }, []);

  const go = (n) => navigate(`/part/${Math.max(1, Math.min(36, n))}`);

  if (err) {
    return (
      <div className="page report-bg">
        <Header />
        <main className="main-content report-main">
          <div className="report-error">
            <div className="report-error-title">데이터 로드 실패</div>
            <div className="report-error-body">{err}</div>
            <div className="report-error-hint">
              확인: <code>/reports/question_reports.json</code>, <code>/questions36.json</code>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!reportData || !qList) {
    return (
      <div className="page report-bg">
        <Header />
        <main className="main-content report-main">
          <div className="report-loading">불러오는 중...</div>
        </main>
      </div>
    );
  }

  const title = qList.find((x) => Number(x.id) === Number(day))?.question || `DAY ${day}`;
  const A = reportData?.A?.[String(day)];
  const B = reportData?.B?.[String(day)];
  const coach = reportData?.coach?.byDay?.[String(day)] || reportData?.coach?.template || {};

  return (
    <div className="page report-bg">
      <Header />
      <main className="main-content report-main">
        <div className="report-card">
          {/* DAY 배너 (홈 톤과 동일 배경 계열) */}
          <div className="report-header soft">
            <div className="report-title">문항별 보고서 · DAY {day}</div>
            <div className="report-sub">{title}</div>
          </div>

          {/* A / B 관점 요약 */}
          <section className="grid two">
            <div className="box persona a">
              <div className="box-title">A 관점</div>
              <p className="para">{A || "(데이터 없음)"}</p>
            </div>
            <div className="box persona b">
              <div className="box-title">B 관점</div>
              <p className="para">{B || "(데이터 없음)"}</p>
            </div>
          </section>

          {/* 코칭 카드 (정렬도/이유/팁/의식) */}
          <section className="grid three">
            <div className="box">
              <div className="box-title">관점 정렬도</div>
              <div className="align-score">
                {Math.round((coach?.alignmentScore || 0) * 100)}%
              </div>
              {coach?.why && <div className="hint">왜? {coach.why}</div>}
            </div>
            <div className="box">
              <div className="box-title">A에게</div>
              <ul className="bullets tight"><li>{coach?.tipA || "—"}</li></ul>
            </div>
            <div className="box">
              <div className="box-title">B에게</div>
              <ul className="bullets tight"><li>{coach?.tipB || "—"}</li></ul>
            </div>
          </section>

          <section className="box">
            <div className="box-title">권장 의식</div>
            <ul className="bullets tight"><li>{coach?.ritual || "—"}</li></ul>
          </section>

          {/* 네비게이션 + 최종 보고서 */}
          <div className="nav-row">
            <button className="btn ghost" onClick={() => navigate("/final-report")}>
              최종 보고서
            </button>
            <div className="spacer" />
            <button className="btn" onClick={() => go(day - 1)} disabled={day <= 1}>이전</button>
            <button className="btn" onClick={() => go(day + 1)} disabled={day >= 36}>다음</button>
          </div>
        </div>
      </main>
    </div>
  );
}
