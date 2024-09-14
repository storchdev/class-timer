document.addEventListener('DOMContentLoaded', function () {
  let remainingElement = document.getElementById('remaining');
  let elapsedElement = document.getElementById('elapsed');
  let specialMessageElement = document.getElementById('p-special-message');
  let mainMessageElement = document.getElementById('p-main-message');

  const offset = Date.now() / 1000 - currentTime;

  var remainingTime;
  var elapsedTime;

  function updateRemainingTime() {
    if (endTime) {
      currentTime = Date.now() / 1000;
      if (debug) currentTime -= offset;
      remainingTime = endTime - currentTime;
      remainingElement.innerText = humanizeTime(remainingTime);
    }
  }

  function updateElapsedTime() {
    if (startTime) {
      currentTime = Date.now() / 1000;
      if (debug) currentTime -= offset;
      elapsedTime = currentTime - startTime;
      elapsedElement.innerText = humanizeTime(elapsedTime);
    }
  }

  updateRemainingTime();
  updateElapsedTime();

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

  setTimeout(() => {
    let remainingInterval = setInterval(() => {
      // Update times
      updateRemainingTime();
      updateElapsedTime();

      // Refresh the page when timer reaches zero

      if (remainingTime <= 0) {
        clearInterval(remainingInterval);
        location.reload();  // Refresh the page
      }

      if (remainingElement) {
        remainingElement.innerText = humanizeTime(Math.round(remainingTime));
      }
      if (elapsedElement) {
        elapsedElement.innerText = humanizeTime(Math.round(elapsedTime));
      }

    }, 1000);  // Update every second
  }, delay);
});