// study_clock/static/script.js

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (totalSeconds < 3600) { // If less than an hour, show MM:SS
        return `${pad(minutes)}:${pad(seconds)}`;
    }

    // Otherwise, show HH:MM:SS
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// --- Section Switching Logic ---
const navItems = document.querySelectorAll('.nav-item');
const clockSections = document.querySelectorAll('.clock-section');

function showSection(sectionId) {
    navItems.forEach(item => item.classList.remove('active'));
    clockSections.forEach(section => section.classList.remove('active'));

    const activeNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    const activeSection = document.getElementById(sectionId + '-section');
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Stop any active intervals when switching sections
    stopStopwatch(); // Stop stopwatch when switching
    // Timer is more complex, its state is handled by its own button interactions
    // For a cleaner switch, you might want to consider stopping/resetting timer too
    // For now, it retains its state if you switch away and come back.
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.dataset.section;
        showSection(sectionId);
    });
});

// --- Current Time Clock ---
const clockDisplay = document.getElementById('clock-display');

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    clockDisplay.textContent = formatTime(hours * 3600 + minutes * 60 + seconds);
}
setInterval(updateClock, 1000);
updateClock(); // Initial call to display clock immediately


// --- Stopwatch ---
const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchStartBtn = document.getElementById('stopwatch-start-btn');
const stopwatchStopBtn = document.getElementById('stopwatch-stop-btn');
const stopwatchResetBtnSw = document.getElementById('stopwatch-reset-btn-sw');

let stopwatchInterval = null;
let stopwatchStartTime = 0;
let stopwatchElapsedTime = 0;

function startStopwatch() {
    if (stopwatchInterval) return; // Prevent multiple intervals

    stopwatchStartTime = Date.now() - stopwatchElapsedTime; // Adjust start time for pause/resume
    stopwatchInterval = setInterval(() => {
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
        stopwatchDisplay.textContent = formatTime(Math.floor(stopwatchElapsedTime / 1000));
    }, 1000);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function resetStopwatch() {
    stopStopwatch();
    stopwatchElapsedTime = 0;
    stopwatchDisplay.textContent = '00:00:00';
}

stopwatchStartBtn.addEventListener('click', startStopwatch);
stopwatchStopBtn.addEventListener('click', stopStopwatch);
stopwatchResetBtnSw.addEventListener('click', resetStopwatch);


// --- Timer ---
const timerDisplay = document.getElementById('timer-display');
const timerInputContainer = document.getElementById('timer-input-container');
const timerHoursSelect = document.getElementById('timer-hours-select');
const timerMinutesSelect = document.getElementById('timer-minutes-select');
const timerSecondsSelect = document.getElementById('timer-seconds-select');
const timerEditBtn = document.getElementById('timer-edit-btn');
const timerSetBtn = document.getElementById('timer-set-btn');
const timerCancelBtn = document.getElementById('timer-cancel-btn');
const timerStartBtn = document.getElementById('timer-start-btn'); // Also acts as Resume
const timerPauseBtn = document.getElementById('timer-pause-btn');
const timerStopBtn = document.getElementById('timer-stop-btn'); // New Stop button
const timerResetBtn = document.getElementById('timer-reset-btn'); // Reset to initial set value

let timerInterval = null;
let timerRemainingSeconds = 0; // Current countdown value
let timerInitialSetSeconds = 25 * 60; // Default to 25 minutes (1500 seconds) for Pomodoro

// --- Timer End Sound ---
const timerEndSound = new Audio('static/alarm.mp3'); // Create audio object
// It's good practice to try to load the audio early, though browser policies might still block play()
timerEndSound.load();

function playTimerEndSound() {
    console.log("Attempting to play timer end sound.");
    timerEndSound.currentTime = 0; // Rewind to start in case it played before
    timerEndSound.loop = false; // Do not loop for a single end sound
    timerEndSound.play().then(() => {
        console.log("Timer end sound started successfully.");
    }).catch(e => {
        console.error("Audio playback error for timer end:", e);
        // Inform user that sound might be blocked and how to enable
        alert("Timer end sound could not play automatically. Please interact with the page (click any button) to enable sound, then retry the timer.");
    });
}
// --- End Timer End Sound ---


// --- Timer Button Visibility Helpers ---
function showTimerDefaultButtons() {
    timerEditBtn.classList.remove('hidden');
    timerResetBtn.classList.remove('hidden');
    timerStartBtn.classList.remove('hidden');
    timerPauseBtn.classList.add('hidden');
    timerStopBtn.classList.add('hidden');
    hideTimerInputVisuals(); // Ensure input dropdowns are hidden
}

function showTimerRunningButtons() {
    timerEditBtn.classList.add('hidden');
    timerResetBtn.classList.add('hidden');
    timerStartBtn.classList.add('hidden');
    timerPauseBtn.classList.remove('hidden');
    timerStopBtn.classList.remove('hidden');
    hideTimerInputVisuals();
}

function showTimerPausedButtons() {
    timerEditBtn.classList.add('hidden');
    timerResetBtn.classList.remove('hidden'); // Allow reset from paused
    timerStartBtn.classList.remove('hidden'); // "Start" now acts as "Resume"
    timerPauseBtn.classList.add('hidden');
    timerStopBtn.classList.remove('hidden');
    hideTimerInputVisuals();
}

// Function to populate the dropdowns
function populateTimerSelects() {
    for (let i = 0; i <= 23; i++) { // Max 23 hours
        const option = document.createElement('option');
        option.value = String(i).padStart(2, '0');
        option.textContent = String(i).padStart(2, '0');
        timerHoursSelect.appendChild(option);
    }
    for (let i = 0; i <= 59; i++) { // Minutes
        const option = document.createElement('option');
        option.value = String(i).padStart(2, '0');
        option.textContent = String(i).padStart(2, '0');
        timerMinutesSelect.appendChild(option);
    }
    for (let i = 0; i <= 59; i++) { // Seconds
        const option = document.createElement('option');
        option.value = String(i).padStart(2, '0');
        option.textContent = String(i).padStart(2, '0');
        timerSecondsSelect.appendChild(option);
    }
}

// Helper to hide input container and ensure main buttons are visible
function hideTimerInputVisuals() {
    timerInputContainer.classList.add('hidden');
}

function showTimerInput() {
    clearInterval(timerInterval); // Stop any running timer when going into edit mode
    timerInterval = null;

    timerInputContainer.classList.remove('hidden');
    timerEditBtn.classList.add('hidden');
    timerStartBtn.classList.add('hidden');
    timerPauseBtn.classList.add('hidden');
    timerStopBtn.classList.add('hidden');
    timerResetBtn.classList.add('hidden'); // Hide reset during editing

    // Set dropdowns to current remaining time or initial set time
    const displaySeconds = timerRemainingSeconds > 0 ? timerRemainingSeconds : timerInitialSetSeconds;
    const currentHours = Math.floor(displaySeconds / 3600);
    const currentMinutes = Math.floor((displaySeconds % 3600) / 60);
    const currentSeconds = displaySeconds % 60;

    timerHoursSelect.value = String(currentHours).padStart(2, '0');
    timerMinutesSelect.value = String(currentMinutes).padStart(2, '0');
    timerSecondsSelect.value = String(currentSeconds).padStart(2, '0');
}

function setTimer() {
    clearInterval(timerInterval); // Clear any existing interval
    timerInterval = null;

    const hours = parseInt(timerHoursSelect.value);
    const minutes = parseInt(timerMinutesSelect.value);
    const seconds = parseInt(timerSecondsSelect.value);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (isNaN(totalSeconds) || totalSeconds <= 0) {
        alert('Please select a valid duration greater than zero.');
        return;
    }

    timerInitialSetSeconds = totalSeconds; // Store for reset
    timerRemainingSeconds = totalSeconds;
    timerDisplay.textContent = formatTime(timerRemainingSeconds);
    showTimerDefaultButtons(); // Show default buttons after setting time
}

function startTimerLogic() {
    if (timerInterval) return; // Already running

    // If timer is at 0 or was stopped, start with initial set seconds
    if (timerRemainingSeconds <= 0 && timerInitialSetSeconds > 0) {
        timerRemainingSeconds = timerInitialSetSeconds;
    } else if (timerRemainingSeconds <= 0 && timerInitialSetSeconds <= 0) {
        // If no time was ever set (e.g., first load), default to 25 minutes
        timerRemainingSeconds = 25 * 60;
        timerInitialSetSeconds = 25 * 60; // Also update initial for future resets
    }

    showTimerRunningButtons();

    timerInterval = setInterval(() => {
        timerRemainingSeconds--;
        timerDisplay.textContent = formatTime(timerRemainingSeconds);

        if (timerRemainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            playTimerEndSound(); // Play sound when timer ends!
            timerDisplay.textContent = '00:00'; // Final display when done
            showTimerDefaultButtons(); // Show default buttons after timer ends
        }
    }, 1000);
}

function pauseTimerLogic() {
    clearInterval(timerInterval);
    timerInterval = null;
    showTimerPausedButtons();
}

function stopTimerLogic() { // Stops and resets to 00:00 display (doesn't change initial set value)
    clearInterval(timerInterval);
    timerInterval = null;
    timerRemainingSeconds = 0; // Set current time to 0
    timerDisplay.textContent = '00:00'; // Display 00:00
    // No need to stop sound here, as it's only triggered once at 0
    showTimerDefaultButtons(); // Go back to default buttons
}

function resetTimerLogic() { // Resets to initial set value
    clearInterval(timerInterval);
    timerInterval = null;

    timerRemainingSeconds = timerInitialSetSeconds; // Set to the last initial set value
    timerDisplay.textContent = formatTime(timerRemainingSeconds);
    showTimerDefaultButtons(); // Show default buttons
}


// Initialize dropdowns and default button state on load
populateTimerSelects();
resetTimerLogic(); // Set initial display and buttons for timer


// --- Event Listeners for Timer ---
timerEditBtn.addEventListener('click', showTimerInput);
timerSetBtn.addEventListener('click', setTimer);
timerCancelBtn.addEventListener('click', showTimerDefaultButtons); // Cancel also hides input and shows default buttons

timerStartBtn.addEventListener('click', startTimerLogic);
timerPauseBtn.addEventListener('click', pauseTimerLogic);
timerStopBtn.addEventListener('click', stopTimerLogic);
timerResetBtn.addEventListener('click', resetTimerLogic);