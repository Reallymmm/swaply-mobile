// Названия статусов объявлений (приходят с сервера английскими словами)
export const STATUS_NAMES = {
  active: 'Активно',
  review: 'На проверке',
  blocked: 'Заблокировано',
  hidden: 'Скрыто',
};

// Время для списка чатов: сегодня - часы и минуты, раньше - дата
export function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Дата и время для истории уведомлений: "18.11.2026 14:05"
export function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Рейтинг продавца: "★ 4.5 (12)" или "Нет отзывов"
export function ratingText(rating, count) {
  return rating ? `★ ${rating} (${count})` : 'Нет отзывов';
}
