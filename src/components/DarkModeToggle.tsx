'use client';

import { FiMoon, FiSun } from 'react-icons/fi';

interface DarkModeToggleProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const DarkModeToggle = ({ darkMode, setDarkMode }: DarkModeToggleProps) => {
  return (
    <button
      className="dark-mode-toggle"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <FiSun /> : <FiMoon />}
    </button>
  );
};

export default DarkModeToggle;