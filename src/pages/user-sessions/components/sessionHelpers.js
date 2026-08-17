import { UAParser } from 'ua-parser-js';

/* ── UA parser ── */
export const parseUA = (ua) => {
    if (!ua) return { browser: null, os: null };
    const result = new UAParser(ua).getResult();
    const browser = result.browser.name
        ? `${result.browser.name}${result.browser.major ? ` ${result.browser.major}` : ''}`
        : null;
    const os = result.os.name
        ? `${result.os.name}${result.os.version ? ` ${result.os.version}` : ''}`
        : null;
    return { browser, os };
};

/* ── Country helpers ── */
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const countryFlag = (code) => {
    if (!code || code.length !== 2) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65));
};

export const countryName = (code) => {
    if (!code) return code;
    try { return regionNames.of(code.toUpperCase()); } catch { return code; }
};
