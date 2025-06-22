import React, { useState, useRef } from 'react';
import { AppSettings } from '../types';
import './Settings.css';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslationChange = (translation: 'ESV' | 'CUVS') => {
    updateSettings({ translation });
  };

  const handleFontSizeChange = (fontSize: number) => {
    updateSettings({ fontSize });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleLanguageChange = (uiLanguage: 'en' | 'zh') => {
    updateSettings({ uiLanguage });
  };

  const exportData = () => {
    const dataToExport = {
      ...settings,
      completedDays: Array.from(settings.completedDays || new Set()),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible-duo-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (!importedData.translation || !importedData.uiLanguage || !importedData.fontSize || !importedData.theme) {
          throw new Error('Invalid data format');
        }

        // Convert completedDays array back to Set if it exists
        if (importedData.completedDays && Array.isArray(importedData.completedDays)) {
          importedData.completedDays = new Set(importedData.completedDays);
        } else {
          importedData.completedDays = new Set();
        }

        // Update settings with imported data
        updateSettings(importedData);
        setImportSuccess(currentText.importSuccess);
        setImportError(null);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setImportError(currentText.importError);
        setImportSuccess(null);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const deleteAllData = () => {
    // Clear localStorage
    localStorage.removeItem('bibleAppSettings');
    
    // Reset to default settings
    const defaultSettings: AppSettings = {
      translation: 'ESV',
      uiLanguage: 'en',
      fontSize: 16,
      theme: 'light',
      selectedPlan: undefined,
      currentDay: 1,
      completedDays: new Set<number>(),
      notifications: {
        enabled: false,
        time: '08:00'
      }
    };
    
    updateSettings(defaultSettings);
    setShowDeleteConfirm(false);
  };

  // UI text based on language
  const uiText = {
    en: {
      title: 'Settings',
      subtitle: 'Customize your Bible reading experience',
      bibleTranslation: 'Bible Translation',
      translationDesc: 'Choose your preferred Bible translation',
      esvTitle: 'English Standard Version (ESV)',
      esvDesc: 'Modern English translation with high accuracy',
      cuvsTitle: 'Chinese Union Version Simplified (CUVS)',
      cuvsDesc: 'Traditional Chinese Bible translation',
      fontSize: 'Font Size',
      fontSizeDesc: 'Adjust the text size for comfortable reading',
      sampleText: 'Sample text',
      theme: 'Theme',
      themeDesc: 'Choose your preferred color scheme',
      lightTheme: 'Light Theme',
      lightDesc: 'Clean and bright interface',
      darkTheme: 'Dark Theme',
      darkDesc: 'Easy on the eyes in low light',
      notifications: 'Notifications',
      notificationsDesc: 'Set up daily reading reminders',
      enableReminders: 'Enable Daily Reminders',
      remindersDesc: 'Get notified to read your daily Bible passage',
      reminderTime: 'Reminder Time:',
      dataManagement: 'Data Management',
      dataManagementDesc: 'Export, import, or delete your reading data',
      exportData: 'Export Data',
      exportDesc: 'Download your reading progress and settings as a JSON file',
      importData: 'Import Data',
      importDesc: 'Restore your reading progress from a previously exported file',
      importSuccess: 'Data imported successfully!',
      importError: 'Failed to import data. Please check the file format.',
      deleteData: 'Delete All Data',
      deleteDesc: 'Permanently delete all your reading progress and settings',
      deleteConfirm: 'Are you sure you want to delete all your data? This action cannot be undone.',
      confirmDelete: 'Yes, Delete All Data',
      cancelDelete: 'Cancel',
      about: 'About',
      aboutDesc: 'BibleDuo is designed to help you develop a consistent daily Bible reading habit.',
      features: 'Features:',
      feature1: 'Daily reading plans',
      feature2: 'Streak tracking',
      feature3: 'Multiple translations',
      feature4: 'Progress visualization',
      feature5: 'Responsive design',
      language: 'Language',
      languageDesc: 'Choose your preferred interface language',
      english: 'English',
      englishDesc: 'English interface',
      chinese: '中文',
      chineseDesc: '中文界面'
    },
    zh: {
      title: '设置',
      subtitle: '自定义您的圣经阅读体验',
      bibleTranslation: '圣经翻译',
      translationDesc: '选择您偏好的圣经翻译',
      esvTitle: '英文标准版 (ESV)',
      esvDesc: '现代英文翻译，准确度高',
      cuvsTitle: '中文和合本简体版 (CUVS)',
      cuvsDesc: '传统中文圣经翻译',
      fontSize: '字体大小',
      fontSizeDesc: '调整文本大小以获得舒适的阅读体验',
      sampleText: '示例文本',
      theme: '主题',
      themeDesc: '选择您偏好的配色方案',
      lightTheme: '浅色主题',
      lightDesc: '干净明亮的界面',
      darkTheme: '深色主题',
      darkDesc: '在弱光环境下护眼',
      notifications: '通知',
      notificationsDesc: '设置每日阅读提醒',
      enableReminders: '启用每日提醒',
      remindersDesc: '收到每日圣经阅读提醒',
      reminderTime: '提醒时间:',
      dataManagement: '数据管理',
      dataManagementDesc: '导出、导入或删除您的阅读数据',
      exportData: '导出数据',
      exportDesc: '将您的阅读进度和设置下载为 JSON 文件',
      importData: '导入数据',
      importDesc: '从之前导出的文件恢复您的阅读进度',
      importSuccess: '数据导入成功！',
      importError: '导入数据失败。请检查文件格式。',
      deleteData: '删除所有数据',
      deleteDesc: '永久删除所有阅读进度和设置',
      deleteConfirm: '您确定要删除所有数据吗？此操作无法撤销。',
      confirmDelete: '是的，删除所有数据',
      cancelDelete: '取消',
      about: '关于',
      aboutDesc: 'BibleDuo 旨在帮助您培养一致的每日圣经阅读习惯。',
      features: '功能:',
      feature1: '每日阅读计划',
      feature2: '连续阅读追踪',
      feature3: '多种翻译版本',
      feature4: '进度可视化',
      feature5: '响应式设计',
      language: '语言',
      languageDesc: '选择您偏好的界面语言',
      english: 'English',
      englishDesc: '英文界面',
      chinese: '中文',
      chineseDesc: '中文界面'
    }
  };

  const currentText = uiText[settings.uiLanguage || 'en'];

  return (
    <div className="settings">
      <div className="settings-content">
        <h2>{currentText.title}</h2>
        <p className="subtitle">{currentText.subtitle}</p>

        <div className="settings-section">
          <h3>{currentText.bibleTranslation}</h3>
          <p>{currentText.translationDesc}</p>
          
          <div className="setting-options">
            <label className="setting-option">
              <input
                type="radio"
                name="translation"
                value="ESV"
                checked={settings.translation === 'ESV'}
                onChange={() => handleTranslationChange('ESV')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.esvTitle}</div>
                <div className="option-description">{currentText.esvDesc}</div>
              </div>
            </label>
            
            <label className="setting-option">
              <input
                type="radio"
                name="translation"
                value="CUVS"
                checked={settings.translation === 'CUVS'}
                onChange={() => handleTranslationChange('CUVS')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.cuvsTitle}</div>
                <div className="option-description">{currentText.cuvsDesc}</div>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{currentText.fontSize}</h3>
          <p>{currentText.fontSizeDesc}</p>
          
          <div className="font-size-control">
            <input
              type="range"
              min="12"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="font-size-slider"
            />
            <div className="font-size-display">
              <span className="font-size-value">{settings.fontSize}px</span>
              <div 
                className="font-size-preview"
                style={{ fontSize: `${settings.fontSize}px` }}
              >
                {currentText.sampleText}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>{currentText.theme}</h3>
          <p>{currentText.themeDesc}</p>
          
          <div className="setting-options">
            <label className="setting-option">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={() => handleThemeChange('light')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.lightTheme}</div>
                <div className="option-description">{currentText.lightDesc}</div>
              </div>
            </label>
            
            <label className="setting-option">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.darkTheme}</div>
                <div className="option-description">{currentText.darkDesc}</div>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{currentText.language}</h3>
          <p>{currentText.languageDesc}</p>
          
          <div className="setting-options">
            <label className="setting-option">
              <input
                type="radio"
                name="language"
                value="en"
                checked={settings.uiLanguage === 'en'}
                onChange={() => handleLanguageChange('en')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.english}</div>
                <div className="option-description">{currentText.englishDesc}</div>
              </div>
            </label>
            
            <label className="setting-option">
              <input
                type="radio"
                name="language"
                value="zh"
                checked={settings.uiLanguage === 'zh'}
                onChange={() => handleLanguageChange('zh')}
              />
              <div className="option-content">
                <div className="option-title">{currentText.chinese}</div>
                <div className="option-description">{currentText.chineseDesc}</div>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>{currentText.notifications}</h3>
          <p>{currentText.notificationsDesc}</p>
          
          <div className="notification-settings">
            <label className="setting-option">
              <input
                type="checkbox"
                checked={settings.notifications?.enabled || false}
                onChange={(e) => updateSettings({ 
                  notifications: { 
                    enabled: e.target.checked,
                    time: settings.notifications?.time || '08:00'
                  }
                })}
              />
              <div className="option-content">
                <div className="option-title">{currentText.enableReminders}</div>
                <div className="option-description">{currentText.remindersDesc}</div>
              </div>
            </label>
            
            {settings.notifications?.enabled && (
              <div className="notification-time">
                <label>{currentText.reminderTime}</label>
                <input
                  type="time"
                  value={settings.notifications?.time || '08:00'}
                  onChange={(e) => updateSettings({ 
                    notifications: { 
                      enabled: settings.notifications?.enabled || false,
                      time: e.target.value 
                    }
                  })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="settings-section dangerous-section">
          <h3>{currentText.dataManagement}</h3>
          <p>{currentText.dataManagementDesc}</p>
          
          <div className="data-management-options">
            <div className="data-option">
              <div className="data-option-content">
                <div className="option-title">{currentText.exportData}</div>
                <div className="option-description">{currentText.exportDesc}</div>
              </div>
              <button className="export-btn" onClick={exportData}>
                {currentText.exportData}
              </button>
            </div>
            
            <div className="data-option">
              <div className="data-option-content">
                <div className="option-title">{currentText.importData}</div>
                <div className="option-description">{currentText.importDesc}</div>
                {importSuccess && <div className="success-message">{importSuccess}</div>}
                {importError && <div className="error-message">{importError}</div>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
              <button 
                className="import-btn" 
                onClick={() => fileInputRef.current?.click()}
              >
                {currentText.importData}
              </button>
            </div>
            
            <div className="data-option">
              <div className="data-option-content">
                <div className="option-title">{currentText.deleteData}</div>
                <div className="option-description">{currentText.deleteDesc}</div>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                {currentText.deleteData}
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="delete-confirmation">
              <div className="confirmation-content">
                <p>{currentText.deleteConfirm}</p>
                <div className="confirmation-buttons">
                  <button 
                    className="confirm-delete-btn" 
                    onClick={deleteAllData}
                  >
                    {currentText.confirmDelete}
                  </button>
                  <button 
                    className="cancel-delete-btn" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {currentText.cancelDelete}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>{currentText.about}</h3>
          <div className="about-content">
            <p>{currentText.aboutDesc}</p>
            <p>{currentText.features}</p>
            <ul>
              <li>{currentText.feature1}</li>
              <li>{currentText.feature2}</li>
              <li>{currentText.feature3}</li>
              <li>{currentText.feature4}</li>
              <li>{currentText.feature5}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 