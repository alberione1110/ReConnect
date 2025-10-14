import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8080",
  timeout: 15000,
});

// 요청: 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답: 401 처리(필요 시 로그인으로 보낼 수 있음)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // window.location.href = "/login"; // 필요하면 활성화
    }
    return Promise.reject(err);
  }
);

export default api;
