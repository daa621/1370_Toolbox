(function () {
  "use strict";

  const STORAGE_KEY = "tippstreifen-theme";
  const STORAGE_KEY_SKIN = "tippstreifen-skin";
  const root = document.documentElement;

  const SKINS = [
    { id: "glass", label: "Glass" , icon: "✨" },
    { id: "office", label: "Office" , icon: "🗂️" },
    { id: "retro", label: "Retro" , icon: "🧮" },
    { id: "mono", label: "Mono" , icon: "⬛" },
    { id: "nightblue", label: "Night" , icon: "🌌" },
    { id: "emerald", label: "Emerald" , icon: "💚" },
    { id: "copper", label: "Copper" , icon: "🟫" },
    { id: "paper", label: "Paper" , icon: "📄" },
    { id: "access", label: "Access" , icon: "♿" },
    { id: "neon", label: "Neon" , icon: "🟣" },
  ];

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
    updateToggle(theme);
  }

  function updateToggle(theme) {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const isDark = theme === "dark";
    btn.setAttribute("aria-pressed", String(isDark));

    const text = btn.querySelector(".pill-toggle__text");
    const icon = btn.querySelector(".pill-toggle__icon");

    if (text) text.textContent = isDark ? "Dark" : "Light";
    if (icon) icon.textContent = isDark ? "🌙" : "☀️";
  }

  function getPreferredSkin() {
    const stored = localStorage.getItem(STORAGE_KEY_SKIN);
    if (stored && SKINS.some(s => s.id === stored)) return stored;
    return "glass";
  }

  function setSkin(skinId) {
    root.dataset.skin = skinId;
    try { localStorage.setItem(STORAGE_KEY_SKIN, skinId); } catch (e) { /* ignore */ }
    updateSkinToggle(skinId);
  }

  function updateSkinToggle(skinId) {
    const btn = document.getElementById("skinNext");
    if (!btn) return;

    const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
    btn.setAttribute("aria-pressed", "true");

    const text = btn.querySelector(".pill-toggle__text");
    const icon = btn.querySelector(".pill-toggle__icon");

    if (text) text.textContent = skin.label;
    if (icon) icon.textContent = skin.icon || "🎨";
  }

  function nextSkin() {
    const current = root.dataset.skin || getPreferredSkin();
    const idx = SKINS.findIndex(s => s.id === current);
    const next = SKINS[(idx + 1 + SKINS.length) % SKINS.length];
    setSkin(next.id);
  }

  function toggleTheme() {
    const current = root.dataset.theme || getPreferredTheme();
    setTheme(current === "dark" ? "light" : "dark");
  }

  // Init
  setTheme(getPreferredTheme());
  setSkin(getPreferredSkin());

  // Bind UI
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (btn) btn.addEventListener("click", toggleTheme);

    const skinBtn = document.getElementById("skinNext");
    if (skinBtn) skinBtn.addEventListener("click", nextSkin);

    // Optional: Alt+T toggles theme | Alt+D cycles design
    document.addEventListener("keydown", (e) => {
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        toggleTheme();
      }
      if (e.altKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        nextSkin();
      }
    });
  });

})();