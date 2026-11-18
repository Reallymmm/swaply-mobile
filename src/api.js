import { API_URL } from './config';

let token = null;
export function setToken(value) {
  token = value;
}
export function getToken() {
  return token;
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Нет связи с сервером. Проверь адрес в src/config.js и что бэкенд запущен.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(typeof data.detail === 'string' ? data.detail : 'Проверь введённые данные');
    err.status = res.status;
    throw err;
  }
  return data;
}

export function photoUrl(path) {
  return path ? API_URL + path : null;
}

export const api = {
  login: (email, password) => request('/api/m/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) =>
    request('/api/m/register', { method: 'POST', body: { name, email, password } }),
  resendCode: (email) => request('/api/m/register/resend', { method: 'POST', body: { email } }),
  confirmRegister: (email, code) =>
    request('/api/m/register/confirm', { method: 'POST', body: { email, code } }),
  me: () => request('/api/m/me'),
  setCity: (city) => request('/api/m/me/city', { method: 'PUT', body: { city } }),
  appealStatus: (email, password) =>
    request('/api/m/appeals/status', { method: 'POST', body: { email, password } }),
  sendAppeal: (email, password, text) =>
    request('/api/m/appeals', { method: 'POST', body: { email, password, text } }),
  user: (id) => request('/api/m/users/' + id),

  feed: (q = '', categoryId = null) =>
    request('/api/m/feed?q=' + encodeURIComponent(q) + (categoryId != null ? '&category_id=' + categoryId : '')),
  listing: (id) => request('/api/m/listings/' + id),
  createListing: (data) => request('/api/m/listings', { method: 'POST', body: data }),
  updateListing: (id, data) => request('/api/m/listings/' + id, { method: 'PUT', body: data }),
  toggleHidden: (id) => request(`/api/m/listings/${id}/toggle-hidden`, { method: 'POST' }),
  myListings: () => request('/api/m/my-listings'),
  addPhoto: (listingId, base64) =>
    request(`/api/m/listings/${listingId}/photos`, { method: 'POST', body: { data: base64 } }),
  deletePhoto: (photoId) => request('/api/m/photos/' + photoId, { method: 'DELETE' }),
  setAvatar: (base64) => request('/api/m/me/avatar', { method: 'POST', body: { data: base64 } }),
  review: (userId, rating, text) =>
    request(`/api/m/users/${userId}/reviews`, { method: 'POST', body: { rating, text } }),
  categories: () => request('/api/categories'),

  notifications: (after) =>
    request('/api/m/notifications' + (after != null ? '?after=' + after : '')),
  notificationsHistory: (before) =>
    request('/api/m/notifications/history' + (before != null ? '?before=' + before : '')),
  readNotifications: (kinds) =>
    request('/api/m/notifications/read', { method: 'POST', body: { kinds } }),

  favorites: () => request('/api/m/favorites'),
  toggleFavorite: (id) => request('/api/m/favorites/' + id, { method: 'POST' }),

  openChat: (listingId) => request('/api/m/chats', { method: 'POST', body: { listing_id: listingId } }),
  chats: () => request('/api/m/chats'),
  chat: (id) => request('/api/m/chats/' + id),
  sendMessage: (id, text) => request(`/api/m/chats/${id}/messages`, { method: 'POST', body: { text } }),
};
