export type AdminSessionUser = {
  id: number;
  nama: string;
  role: string;
  email: string;
};

const STORAGE_KEY = "mwc-admin-user";
let cachedRawValue: string | null | undefined;
let cachedUser: AdminSessionUser | null = null;

export function getAdminFirstName(fullName: string | undefined | null) {
  const normalized = fullName?.trim().replace(/\s+/g, " ") ?? "";
  return normalized ? normalized.split(" ")[0] : "Admin";
}

export function loadAdminUser(): AdminSessionUser | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as AdminSessionUser;
  } catch {
    return null;
  }
}

export function loadAdminUserSnapshot(): AdminSessionUser | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue === cachedRawValue) {
    return cachedUser;
  }

  cachedRawValue = rawValue;

  if (!rawValue) {
    cachedUser = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(rawValue) as AdminSessionUser;
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function saveAdminUser(user: AdminSessionUser) {
  if (typeof window === "undefined") return;

  const rawValue = JSON.stringify(user);
  window.localStorage.setItem(STORAGE_KEY, rawValue);
  cachedRawValue = rawValue;
  cachedUser = user;
}

export function clearAdminUser() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  cachedRawValue = null;
  cachedUser = null;
}