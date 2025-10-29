// src/services/reconnect.js
import axios from "axios";

/** Axios 인스턴스 (세션 쿠키 포함) */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

/** 공통 에러 로깅 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = (error.config?.baseURL || "") + (error.config?.url || "");
    const status = error.response?.status;
    const data = error.response?.data;
    console.log("[API ERR]", {
      url,
      method: error.config?.method,
      status,
      data,
    });
    return Promise.reject(error);
  }
);

/** 요청마다 세션/토큰 세팅 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.withCredentials = true;
  return config;
});

/* =======================
 *  USER / AUTH
 * ======================= */

/** 회원가입 */
export const signUp = (payload) => {
  const {
    userId,
    password,
    passwordConfirm,
    name,
    birthDate,
    job,
    isSubscribed,
  } = payload;

  const body = {
    userId,
    password,
    passwordConfirm: passwordConfirm || password, // 백 검증 호환
    name,
    birthDate, // yyyy-MM-dd
    job,
    isSubscribed: !!isSubscribed,
  };

  return api.post("/user/save", body);
};

/** 로그인(세션 쿠키 획득) */
export const login = (userId, password) =>
  api.post("/user/login", { userId, password }, { withCredentials: true });

/** 로그아웃(세션 무효화) */
export const logout = () => api.post("/user/logout");

/** 유저 단건 조회 */
export const getUser = (userId) =>
  api.get(`/user/${encodeURIComponent(userId)}`);

/**
 * 커플 코드 발급 (POST 바디 없이, Content-Type 제거)
 * - 일부 서버 환경에서 빈 JSON 바디와 Content-Type이 같이 오면 415/400이 날 수 있어 바디 제거
 */
export const issueCoupleCode = (userId) =>
  api.request({
    method: "post",
    url: `/user/${encodeURIComponent(userId)}/coupleCode`,
    withCredentials: true,
    data: undefined,
    headers: {},
    transformRequest: [
      (d, h) => {
        try {
          h.delete?.("Content-Type");
          h.delete?.("content-type");
        } catch {}
        return d;
      },
    ],
  });

/**
 * 커플 코드로 연결 (쿼리스트링 + 바디 없음, Content-Type 제거)
 * - 백엔드 HTML 테스트 코드와 동일한 호출 패턴로 맞춤
 */
export const connectWithCoupleCode = (userId, coupleCode) =>
  api.request({
    method: "post",
    url: `/user/${encodeURIComponent(
      userId
    )}/connect?coupleCode=${encodeURIComponent(coupleCode)}`,
    withCredentials: true,
    data: undefined,
    headers: {},
    transformRequest: [
      (d, h) => {
        try {
          h.delete?.("Content-Type");
          h.delete?.("content-type");
        } catch {}
        return d;
      },
    ],
  });

/* =======================
 *  DIARY
 * ======================= */

/** 다음 질문 번호 조회(서버 기준) */
export const getNextQuestionNumber = (coupleCode) =>
  api.get(`/diary/next/${encodeURIComponent(coupleCode)}`);

/** 다음 질문 번호 조회(안전 래퍼, 실패 시 1) */
export const getNextQuestionNumberSafe = async (coupleCode) => {
  try {
    const { data } = await getNextQuestionNumber(coupleCode);
    return Number(data) || 1;
  } catch {
    return 1;
  }
};

/** 내 일기 단건 조회 */
export const getDiaryDaily = (userId, coupleCode, questionNumber) =>
  api.get(
    `/diary/${encodeURIComponent(userId)}/${encodeURIComponent(
      coupleCode
    )}/${encodeURIComponent(questionNumber)}`
  );

/** 파트너 일기 단건 조회(현재 로그인 유저 기준 파트너) */
export const getPartnerDiaryOnce = (questionNumber) =>
  api.get(`/diary/partner/${encodeURIComponent(questionNumber)}`);

/** 일기 제출(최소 필드만 전송: questionNumber, content) */
export const submitDiary = ({ questionNumber, content }) =>
  api.post(
    "/diary/submit",
    {
      questionNumber: Number(questionNumber || 0),
      content: String(content || ""),
    },
    { withCredentials: true }
  );

/** 둘 다 완료한 마지막 질문 번호 */
export const getLastCompleted = (coupleCode) =>
  api.get(`/diary/last-completed/${encodeURIComponent(coupleCode)}`);

/** 진행상태 헬퍼: 내가 qn 작성했는지 (200 & content 존재) */
export async function isMyAnswered(userId, coupleCode, qn) {
  try {
    const r = await getDiaryDaily(userId, coupleCode, qn);
    return !!r?.data?.content;
  } catch {
    return false; // 400 등은 미작성
  }
}

/** 진행상태 헬퍼: 파트너가 qn 작성했는지 (200 & content 존재) */
export async function isPartnerAnswered(qn) {
  try {
    const r = await getPartnerDiaryOnce(qn);
    return !!r?.data?.content;
  } catch {
    return false; // 400/401 등은 미작성
  }
}

/* =======================
 *  ITEM REPORT
 * ======================= */

/** 아이템 리포트 제출(필요 시 사용) */
export const submitItemReport = (payload) =>
  api.post("/itemReport/submit", payload, { withCredentials: true });

/** 마지막 생성된 아이템 리포트 ID */
export const getLastItemId = (coupleCode) =>
  api.get(`/itemReport/last-item/${encodeURIComponent(coupleCode)}`);

/** 아이템 리포트 조회 */
export const getItemReportById = (coupleCode, itemId) =>
  api.get(
    `/itemReport/${encodeURIComponent(coupleCode)}/${encodeURIComponent(itemId)}`
  );

/* =======================
 *  FINAL REPORT
 * ======================= */

/** 파이널 리포트 제출(필요 시 사용) */
export const submitFinalReport = (payload) =>
  api.post("/finalReport/submit", payload, { withCredentials: true });

/** 파이널 리포트 조회 */
export const getFinalReport = (coupleCode) =>
  api.get(`/finalReport/${encodeURIComponent(coupleCode)}`);

/* =======================
 *  SURVEY
 * ======================= */

/** 초기 설문 저장 */
export const saveSurvey = (payload) =>
  api.post("/survey/save", payload, { withCredentials: true });

/** 내 설문 조회 */
export const getMySurvey = () => api.get("/survey/me");

/** 특정 유저/커플 설문 조회 */
export const getSurveyByCouple = (userId, coupleCode) =>
  api.get(
    `/survey/${encodeURIComponent(userId)}/${encodeURIComponent(coupleCode)}`
  );

/** 설문 조회(404 → null 처리) */
export const getMySurveySafe = async () => {
  try {
    const { data } = await getMySurvey();
    return data || null;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
};
