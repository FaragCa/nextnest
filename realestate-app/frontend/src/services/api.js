import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const searchProperties = (params) => api.post('/search', params);
export const getAmenities = (params) => api.post('/amenities', params);
export const calculateCommute = (params) => api.post('/commute', params);
export const filterAdvanced = (params) => api.post('/filter-advanced', params);
export const getQuizRecommendations = (params) => api.post('/quiz/recommend', params);
export const familyRecommend = (params) => api.post('/family-recommend', params);

export default api;
