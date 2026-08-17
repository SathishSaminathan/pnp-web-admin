// Auth tokens stored as real browser cookies.
// Cannot be HttpOnly because JS must read the token for Bearer auth.
//
// Security layers applied:
//   __Host- prefix (HTTPS) — browser enforces Secure + Path=/ + no Domain,
//                            eliminating cookie injection & subdomain override attacks.
//   SameSite=Strict        — blocks all cross-site request forgery.
//   Secure                 — transmitted over TLS only (production).
//   max-age                — automatic expiry; no persistent token on disk.

const _secure = typeof location !== 'undefined' && location.protocol === 'https:';

// __Host- prefix is the strongest cookie security tier (HTTPS / production).
// On HTTP (localhost dev) the prefix requirement cannot be met, so we use a
// clearly namespaced fallback that is still scoped to this application.
export const AUTH_KEY    = _secure ? '__Host-meralot_adm_sess'  : 'meralot_adm_sess';
export const TOKEN_KEY   = _secure ? '__Host-meralot_adm_token' : 'meralot_adm_token';
export const USER_ID_KEY = _secure ? '__Host-meralot_adm_uid'   : 'meralot_adm_uid';

// Session duration: 8 hours. Server JWT expiry is the real authority —
// a 401 will clear everything via the axios interceptor regardless.
const SESSION_MAX_AGE = 8 * 60 * 60;

const buildCookieString = (name, value, maxAge) => {
    let s = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
    if (_secure) s += '; Secure';
    s += `; max-age=${maxAge}`;
    return s;
};

export const setCookie = (name, value) => {
    document.cookie = buildCookieString(name, value, SESSION_MAX_AGE);
};

export const getCookie = (name) => {
    const prefix = encodeURIComponent(name) + '=';
    const pair = document.cookie.split('; ').find((c) => c.startsWith(prefix));
    return pair ? decodeURIComponent(pair.slice(prefix.length)) : null;
};

export const removeCookie = (name) => {
    document.cookie = buildCookieString(name, '', 0);
};

export const isLoggedIn = () => getCookie(AUTH_KEY) === 'true';
