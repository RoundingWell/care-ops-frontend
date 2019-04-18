export default function initPlatform() {
  const doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);
  doc.setAttribute('data-platform', navigator.platform);
}
