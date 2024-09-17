if (endTime) {
  const timeRemaining = document.getElementById('timeRemaining');
  timeRemaining.addEventListener('mouseover', function () {
    hoveringRemaining = true;
    document.getElementById('timeRemainingSmallHeader').innerText = "ending at";
    document.getElementById('remainingTimerTicking').innerText = get12HourTime(endTime);
  });
  timeRemaining.addEventListener('mouseout', function () {
    hoveringRemaining = false;
    document.getElementById('timeRemainingSmallHeader').innerText = "time remaining";
    updateRemainingTime();
  });
}

if (startTime) {
  const timeElapsed = document.getElementById('timeElapsed');
  timeElapsed.addEventListener('mouseover', function () {
    hoveringElapsed = true;
    document.getElementById('timeElapsedSmallHeader').innerText = "started at";
    document.getElementById('elapsedTimerTicking').innerText = get12HourTime(startTime);
  });

  timeElapsed.addEventListener('mouseout', function () {
    hoveringElapsed = false;
    document.getElementById('timeElapsedSmallHeader').innerText = "time elapsed";
    updateElapsedTime();
  });
}


if (nextClass !== "None") {
  const nextClassElement = document.getElementById('nextClass');

  nextClassElement.addEventListener('mouseover', function () {
    document.getElementById('nextClassSmallHeader').innerText = 'next class starts at';
    document.getElementById('nextClassName').innerText = get12HourTime(nextClassStartTime);
  });

  nextClassElement.addEventListener('mouseout', function () {
    document.getElementById('nextClassSmallHeader').innerText = 'next class';
    document.getElementById('nextClassName').innerText = nextClass;
  });
}
