const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getToken = () => localStorage.getItem('kidzy_admin_token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('kidzy_admin_token', token);
  } else {
    localStorage.removeItem('kidzy_admin_token');
  }
};

export const logout = () => {
  localStorage.removeItem('kidzy_admin_token');
  localStorage.removeItem('kidzy_admin_user');
  window.location.href = '/login';
};

// Helper for fetching with authorization header
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Token expired or invalid, auto logout
    logout();
    throw new Error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ ما أثناء الاتصال بالسيرفر.');
  }

  return data;
};

// ─────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────
export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  if (data.success && data.token) {
    setToken(data.token);
    localStorage.setItem('kidzy_admin_user', JSON.stringify(data.admin));
  }

  return data; // { success, token, admin }
};

// ─────────────────────────────────────────────
// Orders Service
// ─────────────────────────────────────────────
export const getOrders = async (page = 1, limit = 20) => {
  return fetchWithAuth(`/api/orders?page=${page}&limit=${limit}`);
};

export const getOrderById = async (id) => {
  return fetchWithAuth(`/api/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
  return fetchWithAuth(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const deleteOrder = async (id) => {
  return fetchWithAuth(`/api/orders/${id}`, {
    method: 'DELETE',
  });
};

export const getOrderHistory = async (id) => {
  return fetchWithAuth(`/api/orders/${id}/history`);
};


// ─────────────────────────────────────────────
// Messages Service
// ─────────────────────────────────────────────
export const getMessages = async () => {
  return fetchWithAuth('/api/contact');
};

export const deleteMessage = async (id) => {
  return fetchWithAuth(`/api/contact/${id}`, {
    method: 'DELETE',
  });
};

export const viewMessage = async (id) => {
  return fetchWithAuth(`/api/contact/${id}/view`, {
    method: 'PUT',
  });
};

