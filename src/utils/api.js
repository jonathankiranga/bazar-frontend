const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return sessionStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(url, options = {}) {
  const resp = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

export const login = (email, password) =>
  api('/api/school-head/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getSchools = () => api('/api/schools');
export const getFeeStructures = (schoolId) => api(`/api/bazar-pay/fee-structures/${schoolId}`);
export const assignFees = (data) => api('/api/fees/assign', { method: 'POST', body: JSON.stringify(data) });
export const unassignFees = (data) => api('/api/fees/unassign', { method: 'POST', body: JSON.stringify(data) });

export const getDashboard = (schoolId) => api(`/api/bazar-pay/dashboard?school_id=${schoolId}`);
export const recordPayment = (data) => api('/api/bazar-pay/cash-payment', { method: 'POST', body: JSON.stringify(data) });
export const reversePayment = (data) => api('/api/bazar-pay/reverse-payment', { method: 'POST', body: JSON.stringify(data) });
export const getPayments = (schoolId, params = {}) => {
  const q = new URLSearchParams({ school_id: schoolId, ...params }).toString();
  return api(`/api/bazar-pay/payments?${q}`);
};
export const getStudentBalances = (schoolId, term, year) =>
  api(`/api/bazar-pay/student-balances?school_id=${schoolId}&term=${term}&year=${year}`);
export const getStatement = (studentId, term, year) =>
  api(`/api/bazar-pay/statement/${studentId}?term=${term}&year=${year}`);
export const getReport = (schoolId, term, year) =>
  api(`/api/bazar-pay/report?school_id=${schoolId}&term=${term}&year=${year}`);
