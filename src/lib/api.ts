import axios from "axios";

const API_BASE = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth APIs
export const authApi = {
  register: (data: { username: string; email: string; phoneNo: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
};

// Speech APIs
export const speechApi = {
  transcribe: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/speech/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getTopQuestions: () => api.get<string[]>("/speech/top-questions"),
  getDashboard: () =>
    api.get<{
      totalAnalysis: number;
      averageAgentScore: number;
      topQuestionsCount: number;
      totalAudios: number;
    }>("/speech/dashboard"),
  getHistory: () =>
    api.get<Array<{
      id: number;
      transcript: string;
      sentiment: string;
      agentScore: number;
      accuracy: number;
      commonQuestions: string;
      alerts: string;
      fileName: string;
      createdAt: string;
    }>>("/speech/history"),
};

export default api;
