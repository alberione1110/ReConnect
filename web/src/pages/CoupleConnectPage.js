// src/pages/CoupleConnectPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getUser,
  issueCoupleCode,
  connectWithCoupleCode,
} from "../services/reconnect";

const CoupleConnectPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";

  const [myCode, setMyCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (!userId) {
          navigate("/login", { replace: true });
          return;
        }
        const { data } = await getUser(userId);
        if (!alive) return;

        const code = data?.coupleCode || "";
        if (code) {
          localStorage.setItem("coupleCode", code);
          navigate("/home", { replace: true });
          return;
        }
      } catch (e) {
        setMsg("내 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
        navigate("/login", { replace: true });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate, userId]);

  const onIssue = async () => {
    if (busy) return;
    setMsg("");
    setBusy(true);
    try {
      const { data } = await issueCoupleCode(userId);
      const code = data?.coupleCode || data?.code || "";
      if (!code) throw new Error("코드 발급 실패");
      setMyCode(code);
      localStorage.setItem("coupleCode", code); // ✅ 응답값 저장
      alert(`내 커플 코드가 발급되었습니다: ${code}`);
    } catch (e) {
      setMsg(e?.response?.data || "코드 발급 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onConnect = async () => {
    if (busy) return;
    setMsg("");
    const code = partnerCode.trim();
    if (!code) {
      setMsg("상대 커플 코드를 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await connectWithCoupleCode(userId, code);
      const saved = data?.coupleCode || code; // ✅ 서버 응답 우선
      localStorage.setItem("coupleCode", saved);
      alert("연결되었습니다! 메인으로 이동합니다.");
      navigate("/home", { replace: true });
    } catch (e) {
      setMsg(e?.response?.data || "연결에 실패했습니다. 코드를 확인하세요.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <Header />
        <main className="main-content">
          <div className="empty-hint">불러오는 중…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header />
      <main className="main-content" style={{ textAlign: "center" }}>
        <h1 className="main-slogan">커플 등록</h1>
        <p className="sub-slogan">
          서로의 코드를 연결하면 프로그램을 시작할 수 있어요.
        </p>

        {/* 내 코드 발급 */}
        <div style={{ margin: "18px 0" }}>
          <button className="btn big" onClick={onIssue} disabled={busy}>
            내 커플 코드 발급
          </button>
          {myCode && (
            <div style={{ marginTop: 10, fontWeight: 700, color: "#6c4f3d" }}>
              내 코드: <span style={{ fontFamily: "monospace" }}>{myCode}</span>
            </div>
          )}
        </div>

        {/* 상대 코드로 연결 */}
        <div style={{ margin: "18px 0" }}>
          <input
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            placeholder="상대 커플 코드 입력"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cdb6a4",
              background: "#fff",
              minWidth: 220,
              textAlign: "center",
              marginRight: 8,
            }}
            disabled={busy}
          />
          <button className="btn big" onClick={onConnect} disabled={busy}>
            연결하기
          </button>
        </div>

        {msg && (
          <div className="empty-hint" role="alert" style={{ marginTop: 12 }}>
            {msg}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoupleConnectPage;
