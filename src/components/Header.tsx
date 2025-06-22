import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppSettings } from '../types';
import './Header.css';

interface HeaderProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const Header: React.FC<HeaderProps> = ({ settings, updateSettings }) => {
  const location = useLocation();

  // Helper function to check if a path is active with HashRouter
  const isActive = (path: string) => {
    console.log('Debug - location.hash:', location.hash, 'checking path:', path);
    
    if (path === '/') {
      const isHomeActive = location.hash === '' || location.hash === '#/' || location.hash === '#';
      console.log('Debug - isHomeActive:', isHomeActive);
      return isHomeActive;
    }
    
    const isPathActive = location.hash === `#${path}` || location.hash.startsWith(`#${path}/`);
    console.log('Debug - isPathActive for', path, ':', isPathActive);
    return isPathActive;
  };

  // UI text based on language
  const uiText = {
    en: {
      home: 'Home',
      bible: 'Bible',
      readingPlans: 'Reading Plans',
      settings: 'Settings'
    },
    zh: {
      home: '首页',
      bible: '圣经',
      readingPlans: '阅读计划',
      settings: '设置'
    }
  };

  const currentText = uiText[settings.uiLanguage || 'en'];

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>📖 BibleDuo</h1>
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            {currentText.home}
          </Link>
          <Link 
            to={`/bible/${settings.translation === 'ESV' ? 'Genesis' : '创世记'}/1`} 
            className={`nav-link ${isActive('/bible') ? 'active' : ''}`}
          >
            {currentText.bible}
          </Link>
          <Link 
            to="/plan-selector" 
            className={`nav-link ${isActive('/plan-selector') ? 'active' : ''}`}
          >
            {currentText.readingPlans}
          </Link>
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            {currentText.settings}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 