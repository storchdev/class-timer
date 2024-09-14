var hoveringElapsed = false;
var hoveringRemaining = false;


let remainingElement = document.getElementById('remaining-timer-ticking');
let elapsedElement = document.getElementById('elapsed-timer-ticking');
let currentTimeElement = document.getElementById('current-timer-ticking');
let specialMessageElement = document.getElementById('p-special-message');
let mainMessageElement = document.getElementById('p-main-message');

const offset = Date.now() / 1000 - currentTime;

var remainingTime;
var elapsedTime;


// Humanize the time
function humanizeTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = Math.floor(seconds % 60);

  let timeString = '';
  if (hours > 0) timeString += hours + 'h ';
  if (minutes > 0) timeString += minutes + 'm ';
  timeString += secs + 's';
  return timeString;
}

function get12HourTime(timestamp, showSeconds = false) {
  let date = new Date(timestamp * 1000); // Convert to milliseconds
  let hours = date.getHours(); // Get the hour (0-23)
  let minutes = date.getMinutes(); // Get the minutes (0-59)
  let seconds = date.getSeconds();

  // Convert 24-hour format to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Adjust '0' hour to '12'

  // Add leading zero to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Combine into the desired format
  if (showSeconds) {
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${hours}:${minutes}`;
}


function getCurrentTime() {
  let newCurrentTime = Date.now() / 1000;
  if (debug) newCurrentTime -= offset;
  return Math.round(newCurrentTime);
}

function getRemainingTime() {
  if (endTime) {
    remainingTime = endTime - getCurrentTime();
    return Math.round(remainingTime);
  }
}

function getElapsedTime() {
  if (startTime) {
    elapsedTime = getCurrentTime() - startTime;
    return Math.round(elapsedTime);
  }
}

function updateRemainingTime() {
  if (remainingElement && !hoveringRemaining) {
    remainingTime = getRemainingTime();
    remainingElement.innerText = humanizeTime(remainingTime);
  }
}

function updateElapsedTime() {
  if (elapsedElement && !hoveringElapsed) {
    elapsedTime = getElapsedTime();
    elapsedElement.innerText = humanizeTime(elapsedTime);
  }
}

function updateCurrentTime() {
  if (currentTimeElement) {
    currentTime = getCurrentTime();
    currentTimeElement.innerText = get12HourTime(currentTime, true);
  }
}


document.addEventListener('DOMContentLoaded', function () {


  updateRemainingTime();
  updateElapsedTime();


  // Generate message based on state
  function generateSpecialMessage() {
    if (noSchoolLabel) {
      specialMessageElement.innerText = noSchoolLabel;
    } else if (weekend) {
      specialMessageElement.innerText = "Enjoy your weekend!";
    } else if (inBreak) {
      specialMessageElement.innerText = "Get to your next class!";
    } else if (beforeSchool) {
      specialMessageElement.innerText = "Enjoy your day!";
    } else if (inClass && nextClass !== "None") {
      specialMessageElement.innerText = "lock in";
    } else if (inClass && nextClass === "None") {
      specialMessageElement.innerText = "lock in this is the last one";
    } else if (!inClass && nextClass === "None") {
      specialMessageElement.innerText = "School is over!";
    }
    specialMessageElement.innerHTML += " :)"
  }

  function generateMainMessage() {
    if (noSchool) {
      mainMessageElement.innerText = "No school";
    } else if (inBreak) {
      mainMessageElement.innerText = "Break time";
    } else if (beforeSchool) {
      mainMessageElement.innerText = "School has not started yet";
    } else if (inClass) {
      mainMessageElement.innerText = "Class is in progress";
    } else if (!inClass && !nextClass) {
      mainMessageElement.innerText = "School has ended"
    }
    // etc
  }

  generateMainMessage();
  generateSpecialMessage();

  // Timer update logic (similar to previous but handling both elapsed and remaining)

  // Sync the loop to the real clock
  const now = new Date();
  const delay = 1000 - now.getMilliseconds();

  // If neither remaining or elapsed time is set, don't start the timer
  if (!endTime && !startTime) {
    return;
  }

  function synchronizedLoop() {
    // Get the current time
    var now = new Date();
    // Calculate the delay until the next exact second
    var delay = 1000 - now.getMilliseconds();

    setTimeout(function () {
      // Your code to run every second
      console.log("Tick: " + new Date().toLocaleTimeString());

      if (remainingTime <= 0) {
        location.reload();  // Refresh the page
        return;
      }

      // Update times
      updateRemainingTime();
      updateElapsedTime();
      updateCurrentTime();

      // Schedule the next execution
      synchronizedLoop();
    }, delay);
  }

  synchronizedLoop();
});


if (endTime) {
  const timeRemaining = document.getElementById('time-remaining');
  timeRemaining.addEventListener('mouseover', function () {
    hoveringRemaining = true;
    timeRemaining.getElementsByClassName('small-header')[0].innerText = "ending at";
    timeRemaining.getElementsByClassName('timer-ticking')[0].innerText = get12HourTime(endTime);
  });
  timeRemaining.addEventListener('mouseout', function () {
    hoveringRemaining = false;
    timeRemaining.getElementsByClassName('small-header')[0].innerText = "time remaining";
    updateRemainingTime();
  });
}

if (startTime) {
  const timeElapsed = document.getElementById('time-elapsed');
  timeElapsed.addEventListener('mouseover', function () {
    hoveringElapsed = true;
    timeElapsed.getElementsByClassName('small-header')[0].innerText = "started at";
    timeElapsed.getElementsByClassName('timer-ticking')[0].innerText = get12HourTime(startTime);
  });

  timeElapsed.addEventListener('mouseout', function () {
    hoveringElapsed = false;
    timeElapsed.getElementsByClassName('small-header')[0].innerText = "time elapsed";
    updateElapsedTime();
  });
}


if (nextClass !== "None") {
  const nextClassElement = document.getElementById('next-class');

  nextClassElement.addEventListener('mouseover', function () {
    nextClassElement.getElementsByClassName('small-header')[0].innerText = 'next class starts at';
    nextClassElement.getElementsByClassName('class-name')[0].innerText = get12HourTime(nextClassStartTime);
  });

  nextClassElement.addEventListener('mouseout', function () {
    nextClassElement.getElementsByClassName('small-header')[0].innerText = 'next class';
    nextClassElement.getElementsByClassName('class-name')[0].innerText = nextClass;
  });
}
