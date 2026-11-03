(() => {
  const root = document.documentElement;
  const key = 'campus-connect-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try { saved = window.localStorage.getItem(key); } catch { /* Browser storage can be unavailable. */ }
  let chosen = saved === 'light' || saved === 'dark';

  function apply(theme) {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f8fd' : '#101326');
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
  }
  apply(chosen ? saved : system.matches ? 'dark' : 'light');

  function bind() {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => {
        chosen = true;
        apply(button.dataset.themeChoice);
        try { window.localStorage.setItem(key, button.dataset.themeChoice); } catch { /* Keep the current theme without persistence. */ }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
  system.addEventListener('change', event => { if (!chosen) apply(event.matches ? 'dark' : 'light'); });
})();
