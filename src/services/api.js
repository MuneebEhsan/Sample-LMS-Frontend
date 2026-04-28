/**
 * AcadLMS Frontend — API Service
 * All HTTP calls to the backend REST API with auto token refresh
 */
import axios from 'axios';

const BASE = 'https://bk.taleem.life/api/v1';

const api = axios.create({ baseURL: BASE, timeout: 15000,
  headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  const tid   = localStorage.getItem('tenant_id');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  if (tid)   cfg.headers['X-Tenant-ID'] = tid;
  return cfg;
});

api.interceptors.response.use(res => res, async err => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    const rt = localStorage.getItem('refresh_token');
    if (rt) {
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
        localStorage.setItem('access_token', data.access);
        orig.headers.Authorization = `Bearer ${data.access}`;
        return api(orig);
      } catch { 
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant_id');
        window.location.href = '/'; 
      }
    }
  }
  return Promise.reject(err);
});

export const AuthAPI = {
  login:          d  => api.post('/auth/login', d),
  register:       d  => api.post('/auth/register', d),
  logout:         () => api.post('/auth/logout'),
  refresh:        t  => api.post('/auth/refresh', { refreshToken: t }),
  forgotPassword: e  => api.post('/auth/forgot-password', { email: e }),
  resetPassword:  d  => api.post('/auth/reset-password', d),
  verifyEmail:    t  => api.get(`/auth/verify-email?token=${t}`),
  setup2FA:       () => api.post('/auth/2fa/setup'),
  verify2FA:      c  => api.post('/auth/2fa/verify', { code: c }),
  me:             () => api.get('/auth/me'),
};

export const UsersAPI = {
  list:           p       => api.get('/users', { params: p }),
  getById:        id      => api.get(`/users/${id}`),
  create:         d       => api.post('/users', d),
  update:         (id, d) => api.patch(`/users/${id}`, d),
  delete:         id      => api.delete(`/users/${id}`),
  suspend:        id      => api.post(`/users/${id}/suspend`),
  stats:          ()      => api.get('/users/stats/overview'),
};

export const CoursesAPI = {
  list:           p         => api.get('/courses', { params: p }),
  getById:        id        => api.get(`/courses/${id}`),
  create:         d         => api.post('/courses', d),
  update:         (id, d)   => api.patch(`/courses/${id}`, d),
  delete:         id        => api.delete(`/courses/${id}`),
  publish:        id        => api.post(`/courses/${id}/publish`),
  enroll:         id        => api.post(`/courses/${id}/enroll`),
  getEnrolled:    ()        => api.get('/courses/my/enrolled'),
  getProgress:    id        => api.get(`/courses/${id}/progress`),
  markComplete:   aid       => api.post(`/courses/activities/${aid}/complete`),
  getSections:    id        => api.get(`/courses/${id}/sections`),
  getCategories:  ()        => api.get('/courses/categories'),
  search:         (q, p)    => api.get('/courses/search', { params: { q, ...p } }),
  rate:           (id,r,rev)=> api.post(`/courses/${id}/rate`, { rating: r, review: rev }),
};

export const GradesAPI = {
  getGradebook:   cid => api.get(`/grades/course/${cid}`),
  getMyGrades:    cid => api.get(`/grades/course/${cid}/mine`),
  getAllMyGrades:  ()  => api.get('/grades/mine'),
  submit:         d   => api.post('/grades', d),
  getScales:      ()  => api.get('/grades/scales'),
};

export const PaymentsAPI = {
  checkout:       d       => api.post('/payments/checkout', d),
  verify:         d       => api.post('/payments/verify', d),
  getOrders:      p       => api.get('/payments/orders', { params: p }),
  refund:         (id, a) => api.post(`/payments/orders/${id}/refund`, { amount: a }),
  getRevenue:     ()      => api.get('/payments/revenue'),
  getGateways:    ()      => api.get('/payments/gateways'),
  getCoupons:     ()      => api.get('/payments/coupons'),
  createCoupon:   d       => api.post('/payments/coupons', d),
  validateCoupon: d       => api.post('/payments/coupons/validate', d),
  getPayouts:     ()      => api.get('/payments/payouts'),
  getGatewayStats:()      => api.get('/payments/gateway-stats'),
};

export const DRMAPI = {
  getPolicy:      ()      => api.get('/drm/advanced/policy'),
  savePolicy:     d       => api.put('/drm/advanced/policy', d),
  issueToken:     d       => api.post('/drm/tokens/issue', d),
  revokeToken:    d       => api.post('/drm/tokens/revoke', d),
  getFiles:       p       => api.get('/drm/encrypt/files', { params: p }),
  uploadFile:     (fd, p) => api.post('/drm/encrypt/upload', fd,
    { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: p }),
  getViolations:  p       => api.get('/drm/violations', { params: p }),
  reportEvent:    d       => api.post('/drm/advanced/event', d),
  getLicenseProfiles: ()  => api.get('/drm/licenses/profiles'),
  getStorageList: ()      => api.get('/drm/advanced/storage'),
  addStorage:     d       => api.post('/drm/advanced/storage', d),
  testStorage:    id      => api.post(`/drm/advanced/storage/${id}/test`),
};

export const TenantsAPI = {
  list:     p       => api.get('/tenants', { params: p }),
  getById:  id      => api.get(`/tenants/${id}`),
  create:   d       => api.post('/tenants', d),
  update:   (id, d) => api.patch(`/tenants/${id}`, d),
  getStats: id      => api.get(`/tenants/${id}/stats`),
};

export const MessagingAPI = {
  getConversations: ()       => api.get('/messaging/conversations'),
  getMessages:      (id, p)  => api.get(`/messaging/conversations/${id}/messages`, { params: p }),
  sendMessage:      (id, d)  => api.post(`/messaging/conversations/${id}/messages`, d),
  createConv:       d        => api.post('/messaging/conversations', d),
};

export const NotificationsAPI = {
  list:           p  => api.get('/notifications', { params: p }),
  markRead:       id => api.patch(`/notifications/${id}/read`),
  markAllRead:    () => api.post('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const SecurityAPI = {
  getAuditLogs:   p  => api.get('/security/audit', { params: p }),
  getIPRules:     () => api.get('/security/ip-rules'),
  createIPRule:   d  => api.post('/security/ip-rules', d),
  deleteIPRule:   id => api.delete(`/security/ip-rules/${id}`),
  getAppearance:  () => api.get('/security/appearance'),
  saveAppearance: d  => api.put('/security/appearance', d),
};

export const ScormAPI = {
  list:          p       => api.get('/scorm/packages', { params: p }),
  upload:        (fd, p) => api.post('/scorm/packages/upload', fd,
    { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: p }),
  getById:       id      => api.get(`/scorm/packages/${id}`),
  initTracking:  d       => api.post('/scorm/tracking/init', d),
  updateCMI:     (id, d) => api.patch(`/scorm/tracking/${id}`, d),
};

export const SSOAPI = {
  getProviders:   ()      => api.get('/sso/providers'),
  createProvider: d       => api.post('/sso/providers', d),
  updateProvider: (id, d) => api.put(`/sso/providers/${id}`, d),
  deleteProvider: id      => api.delete(`/sso/providers/${id}`),
};

export default api;
