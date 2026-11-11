export interface GoogleDeeplinkUrls {
  webReviewUrl: string;
  googleWriteReviewUrl: string;
  iosMapsScheme: string;
  androidIntentUrl: string;
}

/**
 * Builds OS-aware Google Maps deep-links and universal web review URL.
 * Prevents mobile WebView Google login friction by opening native Google Maps apps when possible.
 */
export function buildGoogleDeeplinks(
  googlePlaceId: string,
  cafeName: string
): GoogleDeeplinkUrls {
  const encodedPlaceId = encodeURIComponent(googlePlaceId.trim());
  const encodedCafeName = encodeURIComponent(cafeName.trim());

  const webUrl = `https://search.google.com/local/writereview?placeid=${encodedPlaceId}`;
  const iosUrl = `comgooglemaps://?q=${encodedCafeName}`;
  const androidUrl = `intent://maps.google.com/maps?q=${encodedCafeName}#Intent;scheme=https;package=com.google.android.apps.maps;end`;

  return {
    webReviewUrl: webUrl,
    googleWriteReviewUrl: webUrl,
    iosMapsScheme: iosUrl,
    androidIntentUrl: androidUrl,
  };
}

/**
 * Detects device platform and returns the optimal URL (native app deep-link or web fallback).
 */
export function getPreferredRedirectUrl(
  links: GoogleDeeplinkUrls,
  userAgent?: string
): string {
  const ua = (
    userAgent ||
    (typeof window !== "undefined" ? window.navigator.userAgent : "")
  ).toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return links.iosMapsScheme;
  }
  if (/android/.test(ua)) {
    return links.androidIntentUrl;
  }
  return links.webReviewUrl;
}

