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

export function logError(message: string, detail?: unknown): void {
  post({
    source: 'mega-demo',
    level: 'error',
    message,
    ...(detail !== undefined && { detail }),
  });
}

export function logPlay(slideIndex: number): void {
  const { language, userAgent } = navigator;
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  post({
    source: 'mega-demo',
    level: 'info',
    message: 'Presentation started',
    detail: {
      slide: slideIndex + 1,
      browser: userAgent,
      language,
      timezone: timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || null,
    },
  });
}
