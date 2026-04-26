import { SLIDE_LABELS } from '../data/slides';

const LOGGING_URL = import.meta.env.VITE_LOGGING_API_URL as string | undefined;
const LOGGING_KEY = import.meta.env.VITE_LOGGING_API_KEY as string | undefined;

function post(payload: object): void {
  if (!LOGGING_URL || !LOGGING_KEY) return;
  fetch(LOGGING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': LOGGING_KEY },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function browserDetail() {
  const { language, userAgent } = navigator;
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  return {
    browser: userAgent,
    language,
    timezone: timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer || null,
  };
}

function slideDetail(slideIndex: number) {
  return {
    slide: slideIndex + 1,
    slideTitle: SLIDE_LABELS[slideIndex] ?? null,
  };
}

export function logError(message: string, detail?: unknown): void {
  post({
    source: 'mega-demo',
    level: 'error',
    message,
    ...(detail !== undefined && { detail }),
  });
}

export function logAskClaude(slideIndex: number): void {
  post({
    source: 'mega-demo',
    level: 'info',
    message: 'Solution Guide opened',
    detail: { ...slideDetail(slideIndex), ...browserDetail() },
  });
}

export function logKiosk(slideIndex: number): void {
  post({
    source: 'mega-demo',
    level: 'info',
    message: 'Kiosk mode opened',
    detail: { ...slideDetail(slideIndex), ...browserDetail() },
  });
}

export function logPlay(slideIndex: number): void {
  post({
    source: 'mega-demo',
    level: 'info',
    message: 'Presentation started',
    detail: { ...slideDetail(slideIndex), ...browserDetail() },
  });
}
