import React from 'react';
import { Link } from 'react-router-dom';
import { AppSettings } from '../types';
import './Dashboard.css';

interface DashboardProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, updateSettings }) => {
  const currentDay = settings.currentDay || 1;
  const completedDays = settings.completedDays || new Set<number>();
  const isTodayCompleted = completedDays.has(currentDay);

  // UI text based on language
  const uiText = {
    en: {
      welcome: 'Welcome to BibleDuo',
      startJourney: 'Start your daily Bible reading journey today!',
      choosePlan: 'Choose a Reading Plan',
      readingProgress: 'Your Reading Progress',
      dayStreak: 'Day Streak',
      currentDay: 'Current Day',
      daysCompleted: 'Days Completed',
      progress: 'Progress',
      daysRemaining: 'Days Remaining:',
      completionRate: 'Completion Rate:',
      days: 'days',
      todaysReading: "Today's Reading",
      completedToday: 'Completed for today!',
      readyToRead: 'Ready to read',
      startReading: 'Start Reading',
      continueReading: 'Continue Reading',
      changePlan: 'Change Plan'
    },
    zh: {
      welcome: '欢迎使用 BibleDuo',
      startJourney: '今天开始您的每日圣经阅读之旅！',
      choosePlan: '选择阅读计划',
      readingProgress: '您的阅读进度',
      dayStreak: '连续天数',
      currentDay: '当前天数',
      daysCompleted: '已完成天数',
      progress: '进度',
      daysRemaining: '剩余天数:',
      completionRate: '完成率:',
      days: '天',
      todaysReading: '今日阅读',
      completedToday: '今日已完成！',
      readyToRead: '准备阅读',
      startReading: '开始阅读',
      continueReading: '继续阅读',
      changePlan: '更改计划'
    }
  };

  const currentText = uiText[settings.uiLanguage || 'en'];

  if (!settings.selectedPlan) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>{currentText.welcome}</h2>
            <p>{currentText.startJourney}</p>
            <Link to="/plan-selector" className="cta-button">
              {currentText.choosePlan}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate streak based on actual completion dates
  let streak = 0;
  const completionDates = settings.completionDates || new Map();
  
  if (completedDays.size > 0) {
    // Get all completion dates
    const completionDateStrings: string[] = [];
    Array.from(completedDays).forEach(dayNumber => {
      const completionDate = completionDates.get(dayNumber);
      if (completionDate) {
        completionDateStrings.push(completionDate);
      } else {
        // If no completion date is stored, use today's date as fallback
        const today = new Date().toISOString().split('T')[0];
        completionDateStrings.push(today);
      }
    });

    // Sort dates chronologically
    const sortedDates = completionDateStrings.sort();
    
    if (sortedDates.length > 0) {
      // Find the most recent completion date
      const mostRecentDate = sortedDates[sortedDates.length - 1];
      const mostRecent = new Date(mostRecentDate);
      
      // Calculate current streak (consecutive calendar days from most recent backwards)
      let currentDate = new Date(mostRecent);
      
      // Count consecutive days backwards
      while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
  }

  const totalDays = 365; // ESV Every Day in the Word plan is 365 days
  const progressPercentage = Math.round((currentDay / totalDays) * 100);
  const daysCompleted = completedDays.size;
  const completionRate = Math.round((daysCompleted / currentDay) * 100);

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="progress-overview">
          <h2>{currentText.readingProgress}</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{streak}</div>
              <div className="stat-label">{currentText.dayStreak}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{currentDay}</div>
              <div className="stat-label">{currentText.currentDay}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{daysCompleted}</div>
              <div className="stat-label">{currentText.daysCompleted}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{progressPercentage}%</div>
              <div className="stat-label">{currentText.progress}</div>
            </div>
          </div>

          <div className="additional-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">{currentText.daysRemaining}</span>
                <span className="stat-value">{totalDays - currentDay} {currentText.days}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{currentText.completionRate}</span>
                <span className="stat-value">{completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="today-status">
            <h3>{currentText.todaysReading}</h3>
            {isTodayCompleted ? (
              <div className="completed-status">
                <span className="status-icon">✅</span>
                <span>{currentText.completedToday}</span>
              </div>
            ) : (
              <div className="pending-status">
                <span className="status-icon">📖</span>
                <span>{currentText.readyToRead}</span>
                <Link 
                  to="/reading"
                  className="read-button"
                >
                  {currentText.startReading}
                </Link>
              </div>
            )}
          </div>

          <div className="quick-actions">
            <Link 
              to="/reading"
              className="action-button primary"
            >
              {currentText.continueReading}
            </Link>
            <Link to="/plan-selector" className="action-button secondary">
              {currentText.changePlan}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 