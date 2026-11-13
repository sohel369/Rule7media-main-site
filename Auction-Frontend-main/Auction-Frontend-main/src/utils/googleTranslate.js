export const clearNonEnglishSourceTranslateCookies = () => {
  if (typeof document === "undefined") return;

  const hasNonEnglishSourceCookie = document.cookie
    .split(";")
    .some((cookie) => {
      const match = cookie.trim().match(/^googtrans=\/([^/]+)\//);
      return match && match[1] !== "en";
    });

  if (!hasNonEnglishSourceCookie) return;

  const hostname = window.location.hostname;
  const labels = hostname.split(".");
  const domains = new Set([hostname, `.${hostname}`]);

  for (let index = 1; index < labels.length - 1; index += 1) {
    const parentDomain = labels.slice(index).join(".");
    domains.add(parentDomain);
    domains.add(`.${parentDomain}`);
  }

  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
  domains.forEach((domain) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`;
  });
};