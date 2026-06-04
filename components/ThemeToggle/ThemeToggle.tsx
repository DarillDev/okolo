'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') ?? 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('okolo-theme', next);
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      type="button"
    >
      {theme === 'dark' ? 'Светлая' : 'Тёмная'}
    </button>
  );
}
