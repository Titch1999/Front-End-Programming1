/**
 * ENT Front-end programming Group 1
 * To do list for students
 * @version 1.0.0
 */

const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task");
const taskFilter = document.querySelector("#filter");
const taskList = document.querySelector(".collection");
const clearBtn = document.querySelector("#clear-tasks");

loadEventListners();

// Load all event listners
function loadEventListners() {
  form.addEventListener("submit", addTask);
  taskList.addEventListener("click", removeTask);
  clearBtn.addEventListener("click", clearTasks);
  taskFilter.addEventListener("keyup", filterTasks);
}

function addTask(e) {
  // check  if a value is passed
  if (taskInput.value === "") {
    alert("Please add a task");
  }

  // creating an li element
  const li = document.createElement("li");
  li.className = "collection-item";
  li.appendChild(document.createTextNode(taskInput.value));
  // creating the delete button
  const link = document.createElement("a");
  link.href = "#";
  link.className = "delete";
  link.textContent = " X";
  li.appendChild(link);

  // adding the list created to the page
  taskList.style.display = "block";
  taskList.appendChild(li);
  taskInput.value = "";

  e.preventDefault();
}

function removeTask(e) {
  // targeting the delete element
  if (e.target.classList.contains("delete")) {
    if (confirm("Are you sure you want to delete this?")) {
      e.target.parentElement.remove();
      if (taskList.innerHTML === "") {
        taskList.style.display = "none";
      }
    }
  }
}

function clearTasks() {
  // clear all tasks
  taskList.innerHTML = "";
  taskList.style.display = "none";
}

function filterTasks(e) {
  // get search input
  const text = e.target.value.toLowerCase(); // change to lower case
  // select all list items
  document.querySelectorAll(".collection-item").forEach((task) => {
    const item = task.firstChild.textContent.toLowerCase();
    if (item.indexOf(text) != -1) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}
