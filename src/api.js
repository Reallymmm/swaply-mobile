import { API_URL } from './config';

// Токен хранится в памяти: после входа он добавляется ко всем запросам
let token = null;
export function setToken(value) {
  token = value;
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
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Проверь введённые данные');
  }
  return data;
}

// Из пути вида /uploads/abc.jpg делаем полный адрес для картинки
export function photoUrl(path) {
  return path ? API_URL + path : null;
}

// Все запросы к серверу собраны здесь
export const api = {
  login: (email, password) => request('/api/m/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) =>
    request('/api/m/register', { method: 'POST', body: { name, email, password } }),
  me: () => request('/api/m/me'),
  user: (id) => request('/api/m/users/' + id),

  feed: (q = '') => request('/api/m/feed?q=' + encodeURIComponent(q)),
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

  favorites: () => request('/api/m/favorites'),
  toggleFavorite: (id) => request('/api/m/favorites/' + id, { method: 'POST' }),

  openChat: (listingId) => request('/api/m/chats', { method: 'POST', body: { listing_id: listingId } }),
  chats: () => request('/api/m/chats'),
  chat: (id) => request('/api/m/chats/' + id),
  sendMessage: (id, text) => request(`/api/m/chats/${id}/messages`, { method: 'POST', body: { text } }),
};
