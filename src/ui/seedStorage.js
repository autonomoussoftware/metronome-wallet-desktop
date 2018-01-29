import settings from '../config/settings';

export function storeSeed(value) {
  return window.localStorage.setItem(settings.SECURE_STORAGE_KEY, value);
}

export function retrieveSeed() {
  return window.localStorage.getItem(settings.SECURE_STORAGE_KEY);
}

export function removeSeed() {
  return window.localStorage.removeItem(settings.SECURE_STORAGE_KEY);
}
