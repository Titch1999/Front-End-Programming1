// --- Helper functions ---
function showInputError(input, message, duration = 1200) {
  input.classList.add("input-error");
  const prevPlaceholder = input.placeholder;
  input.placeholder = message;
  setTimeout(() => {
    input.classList.remove("input-error");
    input.placeholder = prevPlaceholder;
  }, duration);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updatePriorityIndicator(indicator, priority) {
  const colors = { high: "#e53935", medium: "#ffb300", low: "#8bc34a" };
  indicator.style.background = colors[priority] || colors.low;
}

// --- Main logic ---
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const progressBar = document.getElementById("progressBar");

  if (!taskInput || !taskList || !progressBar) {
    console.error("Required DOM elements are missing.");
    return;
  }

  const taskName = taskInput.value.trim();
  if (taskName === "") {
    showInputError(taskInput, "Please enter a task!");
    return;
  }

  // Prevent duplicate tasks (case-insensitive)
  const existingTasks = Array.from(taskList.querySelectorAll("span.task-name"))
    .map(span => span.textContent.trim().toLowerCase());
  if (existingTasks.includes(taskName.toLowerCase())) {
    taskInput.value = "";
    showInputError(taskInput, "Task already exists!");
    return;
  }

  // --- Create task item ---
  const li = document.createElement("li");
  li.style.transition = "opacity 0.35s cubic-bezier(.4,2,.6,1), transform 0.35s cubic-bezier(.4,2,.6,1)";
  li.style.opacity = "0";
  li.style.transform = "translateY(-16px)";

  // Priority indicator
  const priorityIndicator = document.createElement("span");
  priorityIndicator.className = "priority-indicator";
  priorityIndicator.title = "Priority";
  priorityIndicator.style.display = "inline-block";
  priorityIndicator.style.width = "10px";
  priorityIndicator.style.height = "10px";
  priorityIndicator.style.borderRadius = "50%";
  priorityIndicator.style.marginRight = "8px";
  updatePriorityIndicator(priorityIndicator, "low");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.setAttribute("aria-label", "Mark task as completed");
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
    updateProgress();
  });

  // Task name
  const span = document.createElement("span");
  span.textContent = taskName;
  span.className = "task-name";
  span.tabIndex = 0;

  // Timer input
  const timerInput = document.createElement("input");
  timerInput.type = "number";
  timerInput.className = "time-frame";
  timerInput.placeholder = "Minutes";
  timerInput.min = "1";
  timerInput.style.width = "70px";
  timerInput.setAttribute("aria-label", "Set timer in minutes");

  // Timer display
  const timerDisplay = document.createElement("span");
  timerDisplay.className = "timer-display";
  timerDisplay.style.marginLeft = "8px";

  // Timer logic
  let timerInterval = null;
  const startTimerBtn = document.createElement("button");
  startTimerBtn.textContent = "Start Timer";
  startTimerBtn.className = "timer-btn";
  startTimerBtn.onclick = () => {
    const minutes = parseInt(timerInput.value, 10);
    if (isNaN(minutes) || minutes <= 0) {
      showInputError(timerInput, "Enter minutes!", 1000);
      return;
    }
    if (timerInterval) return; // Prevent multiple timers

    let remainingTime = minutes * 60;
    timerInput.disabled = true;
    startTimerBtn.disabled = true;
    timerDisplay.textContent = ` (${formatTime(remainingTime)})`;

    timerInterval = setInterval(() => {
      remainingTime--;
      timerDisplay.textContent = ` (${formatTime(remainingTime)})`;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = " (Time's up!)";
        timerInput.disabled = false;
        startTimerBtn.disabled = false;
        alert(`Time is up for task: "${span.textContent}"`);
      }
    }, 1000);
  };

  // Priority select
  const prioritySelect = document.createElement("select");
  prioritySelect.className = "priority-select";
  ["Low", "Medium", "High"].forEach((level) => {
    const option = document.createElement("option");
    option.value = level.toLowerCase();
    option.textContent = level;
    prioritySelect.appendChild(option);
  });
  prioritySelect.addEventListener("change", () => {
    li.dataset.priority = prioritySelect.value;
    updatePriorityIndicator(priorityIndicator, prioritySelect.value);
    sortTasks();
  });
  li.dataset.priority = "low";

  // Actions
  const actions = document.createElement("div");
  actions.className = "actions";

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "edit-task-input";
    input.style.marginRight = "6px";
    input.onkeydown = (e) => {
      if (e.key === "Enter") input.blur();
    };
    input.onblur = () => {
      const newName = input.value.trim();
      if (newName && newName !== span.textContent) {
        const names = Array.from(taskList.querySelectorAll("span.task-name"))
          .filter(s => s !== span)
          .map(s => s.textContent.trim().toLowerCase());
        if (names.includes(newName.toLowerCase())) {
          showInputError(input, "Duplicate!", 1000);
          input.focus();
          return;
        }
        span.textContent = newName;
      }
      span.style.display = "";
      input.replaceWith(span);
    };
    span.style.display = "none";
    span.parentNode.insertBefore(input, span);
    input.focus();
  };

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.onclick = () => {
    li.style.opacity = "0";
    li.style.transform = "translateX(100px)";
    setTimeout(() => {
      li.remove();
      updateProgress();
    }, 350);
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  // Compose task item
  li.appendChild(priorityIndicator);
  li.appendChild(prioritySelect);
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(timerInput);
  li.appendChild(startTimerBtn);
  li.appendChild(timerDisplay);
  li.appendChild(actions);

  taskList.appendChild(li);

  setTimeout(() => {
    li.style.opacity = "1";
    li.style.transform = "translateY(0)";
  }, 10);

  taskInput.value = "";
  taskInput.focus();

  updateProgress();
  sortTasks();
}

function updateProgress() {
  const taskList = document.getElementById("taskList");
  const progressBar = document.getElementById("progressBar");
  if (!taskList || !progressBar) return;

  const checkboxes = taskList.querySelectorAll(".task-checkbox");
  const totalTasks = checkboxes.length;
  if (totalTasks === 0) {
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = "#1E90FF";
    return;
  }

  const completedTasks = Array.from(checkboxes).filter(cb => cb.checked).length;
  const progress = (completedTasks / totalTasks) * 100;
  progressBar.style.width = `${progress}%`;

  if (progress === 100) {
    progressBar.style.backgroundColor = "#FFD700";
    setTimeout(() => {
      progressBar.style.backgroundColor = "#1E90FF";
    }, 1000);
  } else {
    progressBar.style.backgroundColor = "#1E90FF";
  }
}

function sortTasks() {
  const taskList = document.getElementById("taskList");
  const tasks = Array.from(taskList.children);
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => priorityOrder[a.dataset.priority] - priorityOrder[b.dataset.priority]);
  tasks.forEach((task) => taskList.appendChild(task));
}

function clearAllTasks() {
  const taskList = document.getElementById("taskList");
  if (taskList.children.length === 0) return;
  Array.from(taskList.children).forEach((li, idx) => {
    setTimeout(() => {
      li.style.opacity = "0";
      li.style.transform = "translateX(100px)";
      setTimeout(() => li.remove(), 350);
    }, idx * 40);
  });
  setTimeout(updateProgress, 400);
}

// --- Startup UX ---
document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  if (taskInput) taskInput.focus();
});