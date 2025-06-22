// BibleDuo Widget for Scriptable
// This script fetches your reading progress from the BibleDuo app and displays it as an iOS widget

// Configuration
const APP_URL = "https://evank-wc.github.io/bibleduo/";
const WIDGET_SIZE = config.widgetFamily || "medium";

async function fetchUserData() {
  try {
    // Try to get data from the app's localStorage via webview
    // Since Scriptable can't directly access localStorage, we'll need to create an API endpoint
    // For now, we'll use a fallback approach
    
    // You can create a simple API endpoint that returns your data
    // For example: https://your-api.com/bibleduo-data?user=your-user-id
    
    // For now, let's create a mock data structure that you can replace with real API calls
    const mockData = {
      completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Replace with actual completed days
      completionDates: {
        1: "2024-01-01",
        2: "2024-01-02", 
        3: "2024-01-03",
        4: "2024-01-04",
        5: "2024-01-05",
        6: "2024-01-06",
        7: "2024-01-07",
        8: "2024-01-08",
        9: "2024-01-09",
        10: "2024-01-10"
      },
      currentDay: 11,
      totalDays: 365
    };
    
    return mockData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

function calculateStreaks(completedDays, completionDates) {
  if (!completedDays || completedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };
  }
  
  // Convert completion dates to sorted array
  const completionDateStrings = [];
  completedDays.forEach(dayNumber => {
    const completionDate = completionDates[dayNumber];
    if (completionDate) {
      completionDateStrings.push(completionDate);
    } else {
      // Fallback to today's date
      const today = new Date().toISOString().split('T')[0];
      completionDateStrings.push(today);
    }
  });
  
  // Sort dates chronologically
  const sortedDates = completionDateStrings.sort();
  
  // Find the most recent completion date
  const mostRecentDate = sortedDates[sortedDates.length - 1];
  const mostRecent = new Date(mostRecentDate);
  
  // Calculate current streak (consecutive calendar days from most recent backwards)
  let currentStreak = 0;
  let currentDate = new Date(mostRecent);
  
  // Count consecutive days backwards
  while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
    currentStreak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let currentStreakCount = 0;
  let lastDate = null;
  
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
        longestStreak = Math.max(longestStreak, currentStreakCount);
        currentStreakCount = 1;
      }
    }
    
    lastDate = currentDate;
  });
  
  // Don't forget to check the last streak
  longestStreak = Math.max(longestStreak, currentStreakCount);
  
  return {
    currentStreak,
    longestStreak,
    totalCompleted: completedDays.length
  };
}

function getMotivationalMessage(streak) {
  if (streak === 0) {
    return "Start your journey today! 📖";
  } else if (streak === 1) {
    return "Great start! Keep going! 🌟";
  } else if (streak < 7) {
    return "Building momentum! 💪";
  } else if (streak < 30) {
    return "Amazing dedication! 🔥";
  } else if (streak < 100) {
    return "Unstoppable! 🚀";
  } else {
    return "Legendary! You're incredible! 👑";
  }
}

function getStreakEmoji(streak) {
  if (streak === 0) return "📚";
  if (streak < 3) return "🌟";
  if (streak < 7) return "🔥";
  if (streak < 30) return "⚡";
  if (streak < 100) return "🚀";
  return "👑";
}

async function createWidget() {
  const data = await fetchUserData();
  
  if (!data) {
    const widget = new ListWidget();
    widget.addText("BibleDuo");
    widget.addText("Unable to load data");
    widget.backgroundColor = new Color("#1a1a1a");
    return widget;
  }
  
  const { currentStreak, longestStreak, totalCompleted } = calculateStreaks(
    data.completedDays, 
    data.completionDates
  );
  
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1a1a1a");
  
  // Header
  const headerStack = widget.addStack();
  headerStack.addText("📖 BibleDuo");
  headerStack.addSpacer();
  headerStack.addText(getStreakEmoji(currentStreak));
  
  // Current streak
  const streakStack = widget.addStack();
  streakStack.addText(`${currentStreak}`);
  streakStack.addText(" day streak", { font: Font.caption1 });
  streakStack.addSpacer();
  
  // Progress
  const progressPercentage = data.totalDays > 0 ? (totalCompleted / data.totalDays) * 100 : 0;
  const progressStack = widget.addStack();
  progressStack.addText(`${totalCompleted}/${data.totalDays} days`);
  progressStack.addSpacer();
  progressStack.addText(`${Math.round(progressPercentage)}%`);
  
  // Progress bar
  const progressBarStack = widget.addStack();
  progressBarStack.backgroundColor = new Color("#333333");
  progressBarStack.cornerRadius = 4;
  
  const progressFill = progressBarStack.addStack();
  progressFill.backgroundColor = new Color("#007AFF");
  progressFill.cornerRadius = 4;
  progressFill.width = progressPercentage;
  
  progressBarStack.addSpacer();
  
  // Motivational message
  widget.addText(getMotivationalMessage(currentStreak), { font: Font.caption2 });
  
  // Stats
  const statsStack = widget.addStack();
  statsStack.addText(`Longest: ${longestStreak}`);
  statsStack.addSpacer();
  statsStack.addText(`Completed: ${totalCompleted}`);
  
  // URL to open the app
  widget.url = APP_URL;
  
  return widget;
}

// Create and set the widget
const widget = await createWidget();
Script.setWidget(widget);
Script.complete(); 