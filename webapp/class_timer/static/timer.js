var hoveringElapsed = false;
var hoveringRemaining = false;


let remainingElement = document.getElementById('remainingTimerTicking');
let elapsedElement = document.getElementById('elapsedTimerTicking');
let currentTimeElement = document.getElementById('currentTimerTicking');
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
    currentTimeElement.innerText = get12HourTime(getCurrentTime(), true);
  }
}

function updateTitle() {
  if (endTime) {
    seconds = endTime - getCurrentTime();
    document.title = '⏳' + humanizeTime(seconds);
  }
}

function updateProgressBar() {
  if (currentClass !== "None") {
    let rn = getCurrentTime();
    let percent = (rn - startTime) / (endTime - startTime);
    let rounded = (percent * 100).toFixed(1);
    let parts = rounded.split('.');
    document.getElementById('progressInt').innerHTML = parts[0]; // Integer part
    document.getElementById('progressDecimal').innerHTML = '.' + parts[1]; // Decimal part

    let container = document.querySelector('.progress-container');
    let bar = document.querySelector('.progress-bar')
    let displayWidth = Math.max(percent * container.offsetWidth, container.offsetHeight);
    bar.style.width = displayWidth + 'px';
  }
}

document.addEventListener('DOMContentLoaded', function () {

  const body = document.body;

  // Clear class list 
  body.classList.remove('default', 'before-school', 'in-break', 'in-class');
  body.classList.add(backgroundColor);


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
      updateProgressBar();
      updateTitle();

      // Schedule the next execution
      synchronizedLoop();
    }, delay);
  }

  synchronizedLoop();
});

