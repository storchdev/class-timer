let wakeLock = null;

// Request wake lock automatically when the page is loaded
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake lock is active');
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock is released');
    });
  } catch (err) {
    console.error(`Failed to activate wake lock: ${err.message}`);
  }
}

// Automatically request wake lock when the page is loaded
window.addEventListener('load', requestWakeLock);

// Optionally release the wake lock when the page is unloaded (e.g., when navigating away)
window.addEventListener('beforeunload', () => {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
});