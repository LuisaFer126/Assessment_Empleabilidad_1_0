import axios from "axios";

// Configure this with a Frontend/.env file:
//   VITE_API_URL=http://localhost:5270/api
// If you don't, we default to the backend's launchSettings.json HTTP URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5270/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export type CourseSummary = {
  id: string;
  title: string;
  status: string | number;
  totalLessons: number;
  lastModified: string;
};

export async function getCourseSummary(courseId: string) {
  const res = await api.get<CourseSummary>(`/courses/${courseId}/summary`);
  return res.data;
}
