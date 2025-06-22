import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import './WidgetView.css';

interface WidgetViewProps {
  settings: AppSettings;
}

interface ReadingPlan {
  id: string;
  name: string;
  data2: string[][];
}

const WidgetView: React.FC<WidgetViewProps> = ({ settings }) => {
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const currentDay = settings.currentDay || 1;
  const completedDays = settings.completedDays || new Set<number>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/esveverydayinword_plan.json');
        const planData = await response.json();
        setPlan(planData);
        
        // Calculate streaks and stats
        calculateStreaks();
        
      } catch (error) {
        console.error('Error loading widget data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [settings.completedDays, settings.completionDates]);

  useEffect(() => {
    // Trigger animation when component mounts
    setShowAnimation(true);
  }, []);

  const calculateStreaks = () => {
    if (!plan) return;

    const completedArray = Array.from(completedDays).sort((a, b) => a - b);
    const totalDaysInPlan = plan.data2.length;
    setTotalDays(totalDaysInPlan);
    setTotalCompleted(completedArray.length);

    // Calculate current streak based on actual completion dates
    let streak = 0;
    let maxStreak = 0;

    if (completedArray.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Get completion dates
    const completionDates = settings.completionDates || new Map();
    
    console.log('Debug - Completed days:', completedArray);
    console.log('Debug - Completion dates map:', completionDates);
    
    // Convert completion dates to sorted array of dates
    const completionDateStrings: string[] = [];
    completedArray.forEach(dayNumber => {
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
    
    console.log('Debug - Sorted completion dates:', sortedDates);
    
    if (sortedDates.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Find the most recent completion date
    const mostRecentDate = sortedDates[sortedDates.length - 1];
    const mostRecent = new Date(mostRecentDate);
    
    console.log('Debug - Most recent completion date:', mostRecentDate);
    
    // Calculate current streak (consecutive calendar days from most recent backwards)
    let currentDate = new Date(mostRecent);
    streak = 0;
    
    // Count consecutive days backwards
    while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    console.log('Debug - Current streak:', streak);

    // Calculate longest streak
    let currentStreakCount = 0;
    let lastDate: Date | null = null;
    
    sortedDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (lastDate === null) {
        currentStreakCount = 1;
      } else {
        const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          // Consecutive day
          currentStreakCount++;
        } else {
          // Gap found, reset streak
          maxStreak = Math.max(maxStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      }
      
      lastDate = currentDate;
    });
    
    // Don't forget to check the last streak
    maxStreak = Math.max(maxStreak, currentStreakCount);

    console.log('Debug - Longest streak:', maxStreak);

    setCurrentStreak(streak);
    setLongestStreak(maxStreak);
  };

  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "Start your journey today! 📖";
    } else if (currentStreak === 1) {
      return "Great start! Keep going! 🌟";
    } else if (currentStreak < 7) {
      return "Building momentum! 💪";
    } else if (currentStreak < 30) {
      return "Amazing dedication! 🔥";
    } else if (currentStreak < 100) {
      return "Unstoppable! 🚀";
    } else {
      return "Legendary! You're incredible! 👑";
    }
  };

  const getStreakEmoji = () => {
    if (currentStreak === 0) return "📚";
    if (currentStreak < 3) return "🌟";
    if (currentStreak < 7) return "🔥";
    if (currentStreak < 30) return "⚡";
    if (currentStreak < 100) return "🚀";
    return "👑";
  };

  if (loading) {
    return (
      <div className="widget-container">
        <div className="widget-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="widget-container">
        <div className="widget-error">
          <p>Unable to load data</p>
        </div>
      </div>
    );
  }

  const progressPercentage = totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0;
  const motivationalMessage = getMotivationalMessage();
  const streakEmoji = getStreakEmoji();

  return (
    <div className="widget-container">
      <div className={`widget-content ${showAnimation ? 'animate-in' : ''}`}>
        {/* Header */}
        <div className="widget-header">
          <h1 className="widget-title">BibleDuo</h1>
          <p className="widget-subtitle">Daily Reading</p>
        </div>

        {/* Current Streak */}
        <div className="streak-section">
          <div className="streak-display">
            <div className="streak-emoji">{streakEmoji}</div>
            <div className="streak-info">
              <div className="current-streak">
                <span className="streak-number">{currentStreak}</span>
                <span className="streak-label">Day{currentStreak !== 1 ? 's' : ''} Streak</span>
              </div>
              <div className="motivational-text">{motivationalMessage}</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-text">
              {totalCompleted} of {totalDays} days completed
            </span>
            <span className="progress-percentage">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{longestStreak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalCompleted}</div>
            <div className="stat-label">Total Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalDays - totalCompleted}</div>
            <div className="stat-label">Remaining</div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="today-status">
          {completedDays.has(currentDay) ? (
            <div className="today-completed">
              <span className="status-emoji">✅</span>
              <span className="status-text">Today Completed!</span>
            </div>
          ) : (
            <div className="today-pending">
              <span className="status-emoji">📖</span>
              <span className="status-text">Day {currentDay} Ready</span>
            </div>
          )}
        </div>

        {/* Encouragement */}
        <div className="encouragement">
          <p className="encouragement-text">
            {currentStreak > 0 
              ? `Keep your ${currentStreak}-day streak alive!`
              : "Start your Bible reading journey today!"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default WidgetView; 