import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sms-backend-r0tn.onrender.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach the OTP session token to every request (bazar endpoints require it)
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('session_id');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Retry GETs once on timeout/network errors (Render free tier cold starts can take ~60s)
api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
  const isNetwork = error.code === 'ERR_NETWORK' || error.response == null;
  if (config && config._retried !== true && config.method === 'get' && (isTimeout || isNetwork)) {
    config._retried = true;
    await new Promise(r => setTimeout(r, 5000));
    return api.request(config);
  }
  return Promise.reject(error);
});

// Auth
export async function requestOtp(phone, email) {
  const { data } = await api.post('/api/teachers/request-otp', { phone, email });
  return data;
}

export async function verifyOtp(session_id, code) {
  const { data } = await api.post('/api/teachers/verify-otp', { session_id, code });
  return data;
}

export async function getSchools() {
  const { data } = await api.get('/api/schools');
  return data;
}

// Fee structures
export async function getFeeStructures(schoolId) {
  const { data } = await api.get(`/api/bazar-pay/fee-structures/${schoolId}`);
  return data;
}

export async function assignFees(data) {
  const { data: res } = await api.post('/api/fees/assign', data);
  return res;
}

export async function unassignFees(data) {
  const { data: res } = await api.post('/api/fees/unassign', data);
  return res;
}

// Dashboard
export async function getDashboard(schoolId) {
  const { data } = await api.get('/api/bazar-pay/dashboard', { params: { school_id: schoolId } });
  return data;
}

// Payments
export async function recordPayment(data) {
  const { data: res } = await api.post('/api/bazar-pay/cash-payment', data);
  return res;
}

export async function reversePayment(data) {
  const { data: res } = await api.post('/api/bazar-pay/reverse-payment', data);
  return res;
}

export async function getPayments(schoolId, params = {}) {
  const { data } = await api.get('/api/bazar-pay/payments', { params: { school_id: schoolId, ...params } });
  return data;
}

export async function getStudentBalances(schoolId, term, year, classId) {
  const { data } = await api.get('/api/bazar-pay/student-balances', {
    params: { school_id: schoolId, term, year, class_id: classId }
  });
  return data;
}

export async function getStatement(studentId, term, year) {
  const { data } = await api.get(`/api/bazar-pay/statement/${studentId}`, { params: { term, year } });
  return data;
}

export async function getReport(schoolId, term, year) {
  const { data } = await api.get('/api/bazar-pay/report', { params: { school_id: schoolId, term, year } });
  return data;
}

export async function getParentSubscriptions(schoolId, term, year) {
  const { data } = await api.get('/api/bazar-pay/parent-subscriptions', { params: { school_id: schoolId, term, year } });
  return data;
}

export async function payBulkSubscriptions(data) {
  const { data: res } = await api.post('/api/bazar-pay/pay-bulk-subscriptions', data);
  return res;
}

export async function paySelectedSubscriptions(data) {
  const { data: res } = await api.post('/api/bazar-pay/pay-selected-subscriptions', data);
  return res;
}

export async function getClasses(schoolId) {
  const { data } = await api.get('/api/fees/classes', { params: { school_id: schoolId } });
  return data;
}

export default api;