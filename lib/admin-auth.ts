export const ADMIN_SESSION_COOKIE = "mwc-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export function createAdminSessionValue(userId: number): string {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `${userId}.${Date.now()}.${randomPart}`;
}
