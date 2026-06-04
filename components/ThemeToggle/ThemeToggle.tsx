'use client';

export function ThemeToggle() {
  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('okolo-theme', next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      type="button"
    >
      Toggle theme
    </button>
  );
}
