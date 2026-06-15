const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const signup = (username, password) =>
  request('/signup', { username, password });

export const login = (username, password) =>
  request('/login', { username, password });

export const addData = (userId, type, data) =>
  request('/addData', { userId, type, data });

export const getData = (userId, type) =>
  request('/getData', { userId, type });

export const policeAccess = (userId) =>
  request('/police', { userId });

export const medicalAccess = (userId) =>
  request('/medical', { userId });
