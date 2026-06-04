import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.clear();
  });

  it('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('switches to light when current theme is dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to dark when current theme is light', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists the new theme to localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('okolo-theme')).toBe('light');
  });

  it('reads the current theme from data-theme attribute, not localStorage', () => {
    localStorage.setItem('okolo-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    // attribute was 'light', so toggles to 'dark'
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
