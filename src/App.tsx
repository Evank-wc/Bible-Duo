import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ReadingView from './components/ReadingView';
import PlanSelector from './components/PlanSelector';
import Settings from './components/Settings';
import BibleViewer from './components/BibleViewer';
import WidgetView from './components/WidgetView';
import { AppSettings } from './types';

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bibleAppSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert completedDays array back to Set
      if (parsed.completedDays && Array.isArray(parsed.completedDays)) {
        parsed.completedDays = new Set(parsed.completedDays);
      }
      // Convert completionDates object back to Map
      if (parsed.completionDates && typeof parsed.completionDates === 'object') {
        const completionDatesMap = new Map();
        Object.entries(parsed.completionDates).forEach(([key, value]) => {
          completionDatesMap.set(parseInt(key), value as string);
        });
        parsed.completionDates = completionDatesMap;
      }
      return parsed;
    }
    return {
      translation: 'ESV',
      uiLanguage: 'en',
      fontSize: 16,
      theme: 'light',
      selectedPlan: undefined,
      currentDay: 1,
      completedDays: new Set<number>(),
      completionDates: new Map<number, string>(),
      notifications: {
        enabled: false,
        time: '08:00'
      }
    };
  });

  useEffect(() => {
    // Convert Set and Map to serializable formats for localStorage
    const settingsForStorage = {
      ...settings,
      completedDays: Array.from(settings.completedDays || new Set()),
      completionDates: Object.fromEntries(settings.completionDates || new Map())
    };
    localStorage.setItem('bibleAppSettings', JSON.stringify(settingsForStorage));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className={`App ${settings.theme}`}>
      <Router>
        <Header settings={settings} updateSettings={updateSettings} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  settings={settings}
                  updateSettings={updateSettings}
                />
              } 
            />
            <Route 
              path="/plan-selector" 
              element={
                <PlanSelector 
                  settings={settings}
                  updateSettings={updateSettings}
                />
              } 
            />
            <Route 
              path="/reading" 
              element={
                <ReadingView 
                  settings={settings}
                  updateSettings={updateSettings}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  settings={settings}
                  updateSettings={updateSettings}
                />
              } 
            />
            <Route 
              path="/bible/:bookName?/:chapter?" 
              element={
                <BibleViewer 
                  settings={settings}
                />
              } 
            />
            <Route 
              path="/widget" 
              element={
                <WidgetView 
                  settings={settings}
                />
              } 
            />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
