// src/pages/FinalReportPage.js
import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import "./Report.css";

/** reports/ 와 report/ 둘 다 시도하는 안전 로더 */
const fetchJSONRobust = async (rel) => {
  const base = process.env.PUBLIC_URL || "";
  const clean = rel.replace(/^\/+/, "");
  const candidates = [
    `${base}/reports/${clean}`,  // 현재 네가 둔 위치
    `${base}/report/${clean}`,   // 과거 호환
    `/reports/${clean}`,
    `/report/${clean}`,
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

export default function FinalReportPage() {
  const [finalData, setFinalData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const finalJson = await fetchJSONRobust("final_report.json");
        setFinalData(finalJson);
      } catch (e) {
        console.error(e);
        setErr(String(e.message || e));
      }
    })();
  }, []);

  const points = useMemo(() => {
    if (!finalData) return [];
    return [
      { id: "A", x: finalData?.quadrant?.A?.x ?? 0, y: finalData?.quadrant?.A?.y ?? 0, color: "#7f593f" },
      { id: "B", x: finalData?.quadrant?.B?.x ?? 0, y: finalData?.quadrant?.B?.y ?? 0, color: "#c7a183" },
    ];
  }, [finalData]);

  // -1..1 → 320x320 SVG 매핑
  const mapX = (v) => ((v + 1) / 2) * 320;
  const mapY = (v) => ((1 - (v + 1) / 2)) * 320;

  return (
    <div className="page report-bg">
      <Header />
      <main className="main-content report-main">
        {!finalData && !err && <div className="report-loading">불러오는 중...</div>}
        {err && (
          <div className="report-error">
            <div className="report-error-title">데이터 로드 실패</div>
            <div className="report-error-body">{err}</div>
            <div className="report-error-hint">
              브라우저로 직접 열어보세요: <code>/reports/final_report.json</code>
            </div>
          </div>
        )}

        {finalData && (
          <div className="report-card">
            <div className="report-header soft">
              <div className="report-title">최종 개요</div>
              <div className="report-sub">
                A: {finalData?.types?.A} · B: {finalData?.types?.B} · 커플: {finalData?.types?.pair}
              </div>
            </div>

            {/* 점수 */}
            <section className="grid two">
              <div className="box metric">
                <div className="box-title">애착 경향</div>
                <div className="metric-row">
                  <div className="pill a">A</div>
                  <div className="metric-val">{finalData?.scores?.attachment?.A?.toFixed(2)}</div>
                </div>
                <div className="metric-row">
                  <div className="pill b">B</div>
                  <div className="metric-val">{finalData?.scores?.attachment?.B?.toFixed(2)}</div>
                </div>
              </div>

              <div className="box metric">
                <div className="box-title">안정 경향</div>
                <div className="metric-row">
                  <div className="pill a">A</div>
                  <div className="metric-val">{finalData?.scores?.stability?.A?.toFixed(2)}</div>
                </div>
                <div className="metric-row">
                  <div className="pill b">B</div>
                  <div className="metric-val">{finalData?.scores?.stability?.B?.toFixed(2)}</div>
                </div>
              </div>
            </section>

            {/* 사분면 */}
            <section className="box quad">
              <div className="box-title">관계 사분면</div>
              <svg className="quad-svg" width="100%" height="320" viewBox="0 0 320 320" role="img" aria-label="관계 사분면">
                <rect x="0" y="0" width="320" height="320" fill="#fffaf4" stroke="#e2d4c3" />
                <line x1="0" y1="160" x2="320" y2="160" stroke="#e2d4c3" />
                <line x1="160" y1="0" x2="160" y2="320" stroke="#e2d4c3" />
                {points.map((p) => (
                  <g key={p.id}>
                    <circle cx={mapX(p.x)} cy={mapY(p.y)} r="7" fill={p.color} />
                    <text x={mapX(p.x) + 10} y={mapY(p.y) + 4} fontSize="12" fill="#4c3a2f">{p.id}</text>
                  </g>
                ))}
              </svg>
              <div className="quad-caption">
                X: {finalData?.quadrant?.xLabel} · Y: {finalData?.quadrant?.yLabel}
              </div>
            </section>

            {/* 코칭 */}
            <section className="box">
              <div className="box-title">코칭 해석</div>
              <p className="para">{finalData?.insights?.summary}</p>
              <ul className="bullets">
                {finalData?.insights?.coach?.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </section>

            {/* 강점/리스크/루틴 */}
            <section className="grid three">
              <div className="box">
                <div className="box-title">핵심 강점</div>
                <ul className="bullets">{finalData?.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="box">
                <div className="box-title">핵심 리스크</div>
                <ul className="bullets">{finalData?.risks?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="box">
                <div className="box-title">합의/루틴</div>
                <ul className="bullets tight">
                  {finalData?.routines?.communication?.map((s, i) => <li key={`c${i}`}>{s}</li>)}
                  {finalData?.routines?.rituals?.map((s, i) => <li key={`r${i}`}>{s}</li>)}
                  {finalData?.routines?.scope?.map((s, i) => <li key={`s${i}`}>{s}</li>)}
                </ul>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
