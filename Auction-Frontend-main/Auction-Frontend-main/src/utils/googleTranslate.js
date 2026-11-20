// 40+ Worldwide Languages ordered by total speakers globally
export const WORLD_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "zh-CN", name: "Mandarin Chinese", native: "中文 (简体)" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "fr", name: "French", native: "Français" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "tl", name: "Tagalog (Filipino)", native: "Tagalog" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "no", name: "Norwegian", native: "Norsk" },
  { code: "he", name: "Hebrew", native: "עברית" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "bg", name: "Bulgarian", native: "Български" },
  { code: "sr", name: "Serbian", native: "Српски" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "sl", name: "Slovenian", native: "Slovenščina" },
  { code: "lv", name: "Latvian", native: "Latviešu" },
  { code: "et", name: "Estonian", native: "Eesti" },
];

export const INCLUDED_LANGUAGES_STRING = WORLD_LANGUAGES.map((l) => l.code).join(",");

export const getStoredLanguage = () => {
  if (typeof window === "undefined") return "en";
  try {
    const fromStorage = localStorage.getItem("r7_selected_language");
    if (fromStorage && WORLD_LANGUAGES.some((l) => l.code === fromStorage)) {
      return fromStorage;
    }
    const match = document.cookie.match(/googtrans=\/([^/]+)\/([^;]+)/);
    if (match && match[2]) {
      return match[2];
    }
  } catch {}
  return "en";
};

export const setStoredLanguage = (langCode) => {
  if (typeof window === "undefined" || !langCode) return;
  try {
    localStorage.setItem("r7_selected_language", langCode);
    const domain = window.location.hostname;
    const cookieVal = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (domain.includes(".")) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${domain};`;
    }
  } catch {}
};

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

export const ensureEnglishOptionInTranslate = (containerId) => {
  if (typeof document === "undefined") return;

  const tryUpdate = () => {
    const container = document.getElementById(containerId);
    if (!container) return false;
    const select = container.querySelector(".goog-te-combo");
    if (!select || !select.options || select.options.length === 0) return false;

    // Explicitly show English as the first option
    if (select.options[0].value === "" || select.options[0].text.toLowerCase().includes("select")) {
      select.options[0].text = "English";
      select.options[0].label = "English";
    }

    if (!select.dataset.englishHooked) {
      select.dataset.englishHooked = "true";
      select.addEventListener("change", (e) => {
        if (e.target.value === "" || e.target.value === "en") {
          clearNonEnglishSourceTranslateCookies();
          localStorage.setItem("r7_selected_language", "en");
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
          if (window.location.hostname.includes(".")) {
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
          }
          window.location.reload();
        }
      });
    }
    return true;
  };

  if (!tryUpdate()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (tryUpdate() || attempts > 50) {
        clearInterval(interval);
      }
    }, 150);
  }

  const container = document.getElementById(containerId);
  if (container && window.MutationObserver) {
    const observer = new MutationObserver(() => {
      tryUpdate();
    });
    observer.observe(container, { childList: true, subtree: true });
  }
};
