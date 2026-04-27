function tinyAuthAppUrlRaw(): string | null {
  if (typeof document !== "undefined") {
    const meta = document
      .querySelector('meta[name="sitio:tinyauth-app-url"]')
      ?.getAttribute("content");
    if (typeof meta === "string" && meta.trim().length > 0) {
      return meta.trim();
    }
  }
  const fromVite = import.meta.env.VITE_TINYAUTH_APP_URL;
  if (typeof fromVite === "string" && fromVite.trim().length > 0) {
    return fromVite.trim();
  }
  return null;
}

/**
 * Browser redirect to TinyAuth after API 401. Matches common TinyAuth flow:
 * `https://tinyauth…/?redirect_uri=https://your-app…` (see GitOps `TINYAUTH_APPURL`).
 */
export function tinyAuthBrowserLoginUrl(): string | null {
  const raw = tinyAuthAppUrlRaw();
  if (!raw) {
    return null;
  }
  if (typeof window === "undefined") {
    return null;
  }
  let login: URL;
  try {
    login = new URL(raw.trim());
  } catch {
    return null;
  }
  if (window.location.origin === login.origin) {
    return null;
  }
  login.searchParams.set("redirect_uri", window.location.href);
  return login.href;
}

/** @returns true if a full-page navigation was started */
export function navigateToTinyAuthLoginIfConfigured(): boolean {
  const url = tinyAuthBrowserLoginUrl();
  if (!url) {
    return false;
  }
  window.location.assign(url);
  return true;
}
