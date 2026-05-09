import api from "../api/axios";

export const fetchMyAttempts = () => api.get("/attempts/my");
export const fetchAttemptById = (attemptId) => api.get(`/attempts/${attemptId}`);
