// src/services/reconnect.js
import axios from "axios";

// CRA 프록시 기준: package.json => "proxy": "http://localhost:8080"
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// 로깅
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = (error.config?.baseURL || "") + (error.config?.url || "");
    console.log("[API ERR]", {
      url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// 토큰 부착(있을 때만)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =======================
 *  USER / AUTH
 * ======================= */

export const signUp = async (payload) => {
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
    passwordConfirm: passwordConfirm || password,
    name,
    birthDate,
    job,
    isSubscribed: !!isSubscribed,
  };

  return api.post("/user/save", body);
};

export const login = async (userId, password) =>
  api.post("/user/login", { userId, password });

export const getUser = (userId) =>
  api.get(`/user/${encodeURIComponent(userId)}`);

export const issueCoupleCode = (userId) =>
  api.post(`/user/${encodeURIComponent(userId)}/coupleCode`);

export const connectWithCoupleCode = (userId, coupleCode) =>
  api.post(`/user/${encodeURIComponent(userId)}/connect`, null, {
    params: { coupleCode },
  });

/* =======================
 *  DIARY / QUESTION
 * ======================= */

export const getNextQuestionNumber = (coupleCode) =>
  api.get(`/diaries/next/${encodeURIComponent(coupleCode)}`);

export const getNextQuestionNumberSafe = async (coupleCode) => {
  try {
    const { data } = await getNextQuestionNumber(coupleCode);
    return Number(data?.nextQuestionNumber ?? 1);
  } catch (e) {
    if (e?.response?.status === 404) return 1;
    throw e;
  }
};

export const getDiaryDaily = (userId, coupleCode, questionNumber) =>
  api.get(
    `/diary/${encodeURIComponent(userId)}/${encodeURIComponent(
      coupleCode
    )}/${encodeURIComponent(questionNumber)}`
  );

export const getPartnerDiaryOnce = (questionNumber) =>
  api.get(`/diary/partner/${encodeURIComponent(questionNumber)}`);

export const submitDiary = (body) => api.post("/diary/submit", body);

export const getLastCompleted = (coupleCode) =>
  api.get(`/questions/last-completed/${encodeURIComponent(coupleCode)}`);

/* =======================
 *  ITEM REPORT
 * ======================= */

export const submitItemReport = (payload) =>
  api.post("/itemReport/submit", payload);

export const getLastItemId = (coupleCode) =>
  api.get(`/itemReport/last-item/${encodeURIComponent(coupleCode)}`);

export const getItemReportById = (coupleCode, itemId) =>
  api.get(
    `/itemReport/${encodeURIComponent(coupleCode)}/${encodeURIComponent(itemId)}`
  );

/* =======================
 *  FINAL REPORT
 * ======================= */

export const submitFinalReport = (payload) =>
  api.post("/finalReport/submit", payload);

export const getFinalReport = (coupleCode) =>
  api.get(`/finalReport/${encodeURIComponent(coupleCode)}`);

/* =======================
 *  SURVEY
 * ======================= */

export const saveSurvey = (payload) => api.post("/survey/save", payload);
export const getMySurvey = () => api.get("/survey/me");
export const getSurveyByCouple = (coupleCode) =>
  api.get(`/survey/${encodeURIComponent(coupleCode)}`);

// ✅ 설문 완료 여부 확인(404면 미완료로 간주)
export const getMySurveySafe = async () => {
  try {
    const { data } = await getMySurvey();
    return data || null; // 완료(데이터 존재)
  } catch (e) {
    if (e?.response?.status === 404) return null; // 미완료
    throw e;
  }
};
