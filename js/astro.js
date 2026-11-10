// Low-precision astronomy (Meeus, "Astronomical Algorithms", ch. 25 & 47 main terms).
// Accuracy is about 0.3° for the Moon — enough to find lunar days, but crescent
// visibility right at the threshold can still come out a day off.

const rad = Math.PI / 180, deg = 180 / Math.PI;
const norm = (x) => ((x % 360) + 360) % 360;
const jd = (ms) => ms / 864e5 + 2440587.5;
const HOUR = 3600e3, DAY = 864e5, MYT = 8 * HOUR;

export function moon(ms) {
  const T = (jd(ms) - 2451545) / 36525;
  const L = 218.3164477 + 481267.88123421 * T, D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T, Mp = 134.9633964 + 477198.8675055 * T, F = 93.272095 + 483202.0175233 * T;
  const s = (a) => Math.sin(a * rad), c = (a) => Math.cos(a * rad);
  const lon = norm(L + 6.288774 * s(Mp) + 1.274027 * s(2 * D - Mp) + 0.658314 * s(2 * D) + 0.213618 * s(2 * Mp)
    - 0.185116 * s(M) - 0.114332 * s(2 * F) + 0.058793 * s(2 * D - 2 * Mp) + 0.057066 * s(2 * D - M - Mp)
    + 0.053322 * s(2 * D + Mp) + 0.045758 * s(2 * D - M) - 0.040923 * s(M - Mp) - 0.03472 * s(D) - 0.030383 * s(M + Mp)
    + 0.015327 * s(2 * D - 2 * F) - 0.012528 * s(Mp + 2 * F) + 0.01098 * s(Mp - 2 * F) + 0.010675 * s(4 * D - Mp) + 0.010034 * s(3 * Mp));
  const lat = 5.128122 * s(F) + 0.280602 * s(Mp + F) + 0.277693 * s(Mp - F) + 0.173237 * s(2 * D - F)
    + 0.055413 * s(2 * D - Mp + F) + 0.046271 * s(2 * D - Mp - F) + 0.032573 * s(2 * D + F) + 0.017198 * s(2 * Mp + F)
    + 0.009266 * s(2 * D + Mp - F) + 0.008822 * s(2 * Mp - F);
  const dist = 385000.56 - 20905.355 * c(Mp) - 3699.111 * c(2 * D - Mp) - 2955.968 * c(2 * D) - 569.925 * c(2 * Mp);
  return { lon, lat, dist };
}

export function sun(ms) {
  const T = (jd(ms) - 2451545) / 36525, M = 357.52911 + 35999.05029 * T;
  const lon = 280.46646 + 36000.76983 * T + (1.914602 - 0.004817 * T) * Math.sin(M * rad) + 0.019993 * Math.sin(2 * M * rad);
  return { lon: norm(lon), lat: 0 };
}

// Lahiri ayanamsa (linear approximation), for sidereal (Tamil calendar) positions.
const ayanamsa = (ms) => 23.853 + ((ms / DAY + 2440587.5 - 2451545) / 365.25) * 0.013969;
const sidereal = (lon, ms) => norm(lon - ayanamsa(ms));
const elong = (ms) => norm(moon(ms).lon - sun(ms).lon); // 0 = new moon, 180 = full moon

function altitude(ms, body, phi, lambda) {
  const eps = 23.439 * rad, l = body.lon * rad, b = body.lat * rad;
  const ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
  const H = norm(280.46061837 + 360.98564736629 * (jd(ms) - 2451545) + lambda) * rad - ra;
  return Math.asin(Math.sin(phi * rad) * Math.sin(dec) + Math.cos(phi * rad) * Math.cos(dec) * Math.cos(H)) * deg;
}

// Instant when the elongation crosses `target` degrees, searching forward hourly from `from`.
function nextPhase(from, target) {
  const f = (t) => norm(elong(t) - target + 180) - 180;
  for (let t = from; ; t += HOUR) {
    if (f(t) < 0 && f(t + HOUR) >= 0) {
      let lo = t, hi = t + HOUR;
      for (let i = 0; i < 16; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
      return lo;
    }
  }
}
export const nextNewMoon = (from) => nextPhase(from, 0);
export const nextFullMoon = (from) => nextPhase(from, 180);

// UTC-midnight timestamp that labels the Malaysian (UTC+8) calendar date of instant `ms`.
export const mytDay = (ms) => Math.floor((ms + MYT) / DAY) * DAY;

// ---- Hijri month start (Malaysia, MABIMS 2021 criteria: altitude ≥ 3°, elongation ≥ 6.4° at sunset) ----
const PHI = 2.9, LAMBDA = 101.7; // reference point on the west coast of the Peninsula
const MARGIN = 0.4;              // degrees: closer than this to a threshold is flagged as uncertain

export function hijriMonthStart(conj) {
  let day = mytDay(conj);
  for (let attempt = 0; attempt < 2; attempt++, day += DAY) {
    let ss = null;
    for (let min = 18.5 * 60; min <= 20 * 60; min++) {
      const t = day - MYT + min * 60e3;
      if (altitude(t, sun(t), PHI, LAMBDA) < -0.833) { ss = t; break; }
    }
    if (ss === null || ss < conj) continue;
    const mo = moon(ss);
    const alt = altitude(ss, mo, PHI, LAMBDA) - Math.asin(6378 / mo.dist) * deg;
    const el = Math.acos(Math.cos(mo.lat * rad) * Math.cos((mo.lon - sun(ss).lon) * rad)) * deg;
    const uncertain = Math.abs(alt - 3) < MARGIN || Math.abs(el - 6.4) < MARGIN;
    return { start: alt >= 3 && el >= 6.4 ? day + DAY : day + 2 * DAY, uncertain };
  }
  return { start: day + 2 * DAY, uncertain: false };
}

// ---- Thaipusam: Pusam nakshatra day nearest the full moon of the Tamil month Thai ----
// Checked against Malaysian dates 2010–2026 (17/17).
export function thaipusam(year) {
  let fm = nextFullMoon(Date.UTC(year, 0, 1));
  while (sidereal(sun(fm).lon, fm) < 270) fm = nextFullMoon(fm + 5 * DAY);
  let best = null;
  for (let d = mytDay(fm) - 3 * DAY; d <= mytDay(fm) + 3 * DAY; d += DAY) {
    const t = d + 6 * HOUR, m = sidereal(moon(t).lon, t);
    if (m < 93.333 || m >= 106.667) continue;
    if (!best || Math.abs(t - fm) < best.dist) best = { d, dist: Math.abs(t - fm) };
  }
  return best ? best.d : mytDay(fm);
}

// ---- Deepavali: first day before the new moon of Aippasi whose sunrise falls in the
// 14th tithi or later. Checked against Malaysian dates 2010–2026 (17/17).
export function deepavali(year) {
  let nm = nextNewMoon(Date.UTC(year, 9, 1));
  while (sidereal(sun(nm).lon, nm) < 180) nm = nextNewMoon(nm + 5 * DAY);
  const nmDay = mytDay(nm);
  for (let d = nmDay - 3 * DAY; d <= nmDay; d += DAY) {
    if (elong(d - HOUR) >= 336) return d; // 07:00 MYT
  }
  return nmDay - DAY;
}

// ---- Precise new moon (Meeus ch. 49, error about a minute) ----
// Used for Chinese lunar month boundaries, where the browser's built-in calendar
// can be a day off when the new moon is close to midnight (e.g. 6 Feb 2027, 23:56 MYT).
export function newMoonK(k) {
  const T = k / 1236.85, s = (a) => Math.sin(norm(a) * rad);
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T ** 3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
  const O = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3;
  let c = -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F) + 0.00739 * E * s(Mp - M)
    - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M) - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F)
    + 0.00056 * E * s(2 * Mp + M) - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
    - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O) - 0.00007 * s(Mp + 2 * M) + 0.00004 * s(2 * Mp - 2 * F)
    + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F) + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F)
    + 0.00003 * s(Mp - M + 2 * F) - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
  const A = [[299.77, 0.107408, 0.000325], [251.88, 0.016321, 0.000165], [251.83, 26.651886, 0.000164],
    [349.42, 36.412478, 0.000126], [84.66, 18.206239, 0.00011], [141.74, 53.303771, 0.000062], [207.14, 2.453732, 0.00006],
    [154.84, 7.30686, 0.000056], [34.52, 27.261239, 0.000047], [207.19, 0.121824, 0.000042], [291.34, 1.844379, 0.00004],
    [161.72, 24.198154, 0.000037], [239.56, 25.513099, 0.000035], [331.55, 3.592518, 0.000023]];
  for (const [i, [a, b, coef]] of A.entries()) c += coef * s(a + b * k - (i === 0 ? 0.009173 * T * T : 0));
  const deltaT = 69 + 0.4 * ((k / 12.3685) + 2000 - 2026); // seconds, rough extrapolation
  return (jde + c - 2440587.5) * DAY - deltaT * 1000;
}

// All new moons (UTC ms) between two instants.
export function newMoonsBetween(fromMs, toMs) {
  const out = [];
  let k = Math.floor(((fromMs / DAY + 2440587.5 - 2451550.09766) / 29.530588861)) - 1;
  for (let t = newMoonK(k); t < toMs; t = newMoonK(++k)) if (t >= fromMs) out.push(t);
  return out;
}
