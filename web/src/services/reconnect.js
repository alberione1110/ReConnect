import api from "../lib/api";

// ========== USER ==========
export const signUp = (body) => api.post("/api/user/save", body);

export const login = async (body) => {
  const { data } = await api.post("/api/user/login", body);
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?.userId) localStorage.setItem("userId", data.userId);
  return data;
};

export const getUser = (userId) => api.get(`/api/user/${encodeURIComponent(userId)}`);

export const issueCoupleCode = (userId) =>
  api.post(`/api/user/${encodeURIComponent(userId)}/coupleCode`);

export const connectWithCoupleCode = (userId, coupleCode) =>
  api.post(`/api/user/${encodeURIComponent(userId)}/connect`, null, {
    params: { coupleCode },
  });

// ========== DIARY ==========
export const submitDiary = (body) => api.post("/api/diary/submit", body);

export const getDiaryDaily = (userId, coupleCode, questionNumber) =>
  api.get(
    `/api/diary/${encodeURIComponent(userId)}/${encodeURIComponent(
      coupleCode
    )}/${questionNumber}`
  );

export const getPartnerDiaryOnce = (questionNumber) =>
  api.get(`/api/diary/partner/${questionNumber}`);

// ========== PROGRESS ==========
export const getLastCompleted = (coupleCode) =>
  api.get(`/api/questions/last-completed/${encodeURIComponent(coupleCode)}`);

export const getNextQuestionNumber = (coupleCode) =>
  api.get(`/api/diaries/next/${encodeURIComponent(coupleCode)}`);

// ========== ITEM REPORT (Daily) ==========
export const submitItemReport = (body) => api.post("/api/itemReport/submit", body);

export const getLastItemId = (coupleCode) =>
  api.get(`/api/itemReport/last-item/${encodeURIComponent(coupleCode)}`);

export const getItemReportById = (coupleCode, itemId) =>
  api.get(`/api/itemReport/${encodeURIComponent(coupleCode)}/${itemId}`);

// ========== FINAL REPORT ==========
export const submitFinalReport = (body) => api.post("/api/finalReport/submit", body);
export const getFinalReport = (coupleCode) =>
  api.get(`/api/finalReport/${encodeURIComponent(coupleCode)}`);

// ========== SURVEY ==========
export const saveSurvey = (body) => api.post("/api/survey/save", body);
export const getMySurvey = () => api.get("/api/survey/me");
export const getSurveyByCouple = (coupleCode) =>
  api.get(`/api/survey/${encodeURIComponent(coupleCode)}`);
