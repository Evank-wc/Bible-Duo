// BibleDuo Widget Data Updater
// Run this script when you complete a reading day to update your widget data

// Get current data
let currentData;
try {
  const keychain = Keychain.get("BibleDuoData");
  if (keychain) {
    currentData = JSON.parse(keychain);
  } else {
    currentData = {
      completedDays: [],
      completionDates: {},
      currentDay: 1,
      totalDays: 365
    };
  }
} catch (error) {
  currentData = {
    completedDays: [],
    completionDates: {},
    currentDay: 1,
    totalDays: 365
  };
}

// Get today's date
const today = new Date().toISOString().split('T')[0];

// Ask user which day they completed
const alert = new Alert();
alert.title = "BibleDuo - Mark Day Complete";
alert.message = "Which day did you complete?";
alert.addTextField("Day Number", currentData.currentDay.toString());
alert.addAction("Mark Complete");
alert.addCancelAction("Cancel");

const response = await alert.presentAlert();

if (response === 0) { // User tapped "Mark Complete"
  const dayNumber = parseInt(alert.textFieldValue(0));
  
  if (dayNumber && dayNumber > 0) {
    // Add to completed days if not already there
    if (!currentData.completedDays.includes(dayNumber)) {
      currentData.completedDays.push(dayNumber);
      currentData.completedDays.sort((a, b) => a - b);
    }
    
    // Add completion date
    currentData.completionDates[dayNumber] = today;
    
    // Update current day
    currentData.currentDay = dayNumber + 1;
    
    // Save to keychain
    Keychain.set("BibleDuoData", JSON.stringify(currentData));
    
    // Show confirmation
    const confirmAlert = new Alert();
    confirmAlert.title = "Success!";
    confirmAlert.message = `Day ${dayNumber} marked as complete!\n\nYour widget will update automatically.`;
    confirmAlert.addAction("OK");
    await confirmAlert.presentAlert();
    
    console.log("Data updated:", currentData);
  } else {
    const errorAlert = new Alert();
    errorAlert.title = "Error";
    errorAlert.message = "Please enter a valid day number.";
    errorAlert.addAction("OK");
    await errorAlert.presentAlert();
  }
}

Script.complete(); 