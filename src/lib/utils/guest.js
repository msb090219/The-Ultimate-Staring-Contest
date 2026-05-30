const GUEST_ID_KEY = 'stare_guest_id';
const GUEST_NAME_KEY = 'stare_guest_name';

export function generateGuestId() {
  return 'guest_' + crypto.randomUUID();
}

export function generateGuestName() {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `Guest-${randomNum}`;
}

export function getOrCreateGuest() {
  if (typeof window === 'undefined') {
    return { id: generateGuestId(), name: generateGuestName() };
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  let guestName = localStorage.getItem(GUEST_NAME_KEY);

  if (!guestId || !guestName) {
    guestId = generateGuestId();
    guestName = generateGuestName();
    localStorage.setItem(GUEST_ID_KEY, guestId);
    localStorage.setItem(GUEST_NAME_KEY, guestName);
  }

  return { id: guestId, name: guestName };
}

export function getGuestId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

export function getGuestName() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_NAME_KEY);
}

export function isGuest(userId) {
  return userId?.startsWith('guest_') || false;
}

export function resetGuest() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
}
