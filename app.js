/*

Overview: 
The task manager can perform the following tasks: 
- Show the current date at the top (below 'My Day')
- Add tasks
- Mark tasks as important
- Mark tasks as completed
- Edit and delete tasks
- Toggle the visibility of completed tasks
- Keep tasks in local storage so they remain available across browser sessions

*/

/* 

Event listeners to listen out for specific events, 
including page loading and buttons pressed 
e.g. Enter to add task, completed tasks, 

*/

// When the document is fully loaded, set current date, load tasks from local stroage, and update visibility of the completed list
document.addEventListener('DOMContentLoaded', function() {
  setCurrentDate();
  loadTasks();

  const completedHeader = document.querySelector('.completed-header');
  const completedList = document.getElementById('completedList');

  // Function to update the visibility of the 'completed-header' based on the number of tasks in the 'completedList'.
  function updateCompletedVisibility() {
    if (completedList.children.length > 0) {
        completedHeader.style.display = 'block';
    } else {
        completedHeader.style.display = 'none';
    }
  }
  
    // Use a mutation observer to listen for changes to the completedList
    const observer = new MutationObserver(function(mutations) {
      updateCompletedVisibility();
    });
  
    observer.observe(completedList, {
      childList: true, // This listens for the addition/removal of child elements
    });

  updateCompletedVisibility()

});

// Listen if 'Important' link is clicked
document.getElementById('filterImportantLink').addEventListener('click', toggleImportantTasksDisplay);


// Listen if 'taskInput' is selecteds to show or hide additional task options on input focus/blur
document.getElementById('taskInput').addEventListener('focus', showTaskOptions);
document.getElementById('taskInput').addEventListener('blur', hideTaskOptions);

// Listen for keyup event on 'taskInput' to detect when Enter key is pressed
document.getElementById('taskInput').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    // Check if input has value before adding a task
    if (taskText) {
      addTask(taskText); // Add task to the list
      taskInput.value = ''; // Reset the input field after adding the task
    }
  }
});

// Listen for click event on the 'toggleCompleted' button and call the 'toggleCompletedList' function
document.getElementById('toggleCompleted').addEventListener('click', toggleCompletedList);

/* For setting current date */

// Function to set the current date
function setCurrentDate() {
  var today = new Date();
  var dayName = today.toLocaleString('en-US', { weekday: 'long' });
  var monthName = today.toLocaleString('en-US', { month: 'long' });
  var day = today.getDate();

  var formattedDate = dayName + ', ' + monthName + ' ' + day;
  var dateElement = document.getElementById('currentDate');
  dateElement.innerHTML = formattedDate;
}
 /* 
 
 Checkboxes for the task input
 
 
 */ 

// Show the checkbox in the "Add A Task" input field
function showCheckbox() {
  const checkbox = document.getElementById('taskCheckbox');
  const input = document.getElementById('taskInput');
  checkbox.style.display = 'inline-block';
  input.placeholder = 'Add a task';
}

// Hide the checkbox and set default placeholder for the input
function hideCheckbox() {
  const checkbox = document.getElementById('taskCheckbox');
  const input = document.getElementById('taskInput');
  checkbox.style.display = 'none';
  input.placeholder = '+     Add a task';
}

/* For adding and editing tasks 



*/


// Adds a task to either the task list or the completed list

function addTask(taskText, isImportant = false, isDone = false) {
  // Return early if the provided task text is empty or just white spaces
  if (!taskText || taskText.trim().length === 0) {
    return;
  }

  // Retrieve the list elements for tasks and completed tasks

  const taskList = document.getElementById('taskList');
  const completedList = document.getElementById('completedList');

  // Create a new list item for the task

  const li = document.createElement('li');

  // Create a checkbox for the task

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isDone;  // Mark as done if specified
  checkbox.addEventListener('change', toggleDone);  // Attach event to handle task completion toggle

  // Create a span to hold the task text

  const span = document.createElement('span');
  span.innerText = taskText;
  // Attach events to enable task editing on double click and to stop editing when focus is lost
  span.addEventListener('dblclick', editTask);
  span.addEventListener('blur', stopEditing);

  // Create a label for the task (e.g., "Tasks")

  const tasksLabel = document.createElement('span');  
  tasksLabel.innerText = 'Tasks';                      
  tasksLabel.className = 'task-label';

  // Create a wrapper for the task text and its label

  const taskWrapper = document.createElement('div');  
  taskWrapper.className = 'task-wrapper';
  taskWrapper.appendChild(span);                      
  taskWrapper.appendChild(tasksLabel);

  // Create an icon (star) to denote if a task is important

  const star = document.createElement('span');
  star.classList.add('star');

  // Set the star icon and tooltip based on the task's importance

  star.innerText = isImportant ? '★' : '☆';
  star.title = isImportant ? 'Unmark as important' : 'Mark as important';
  star.addEventListener('click', toggleImportant);  // Attach event to handle importance toggle

  // Apply styles based on the task's importance and completion status

  if (isImportant) {
    li.classList.add('important');
  }
  if (isDone) {
    li.classList.add('done');
  }

  // Append the checkbox, task wrapper (text + label), and the star icon to the list item
  li.appendChild(checkbox);
  li.appendChild(taskWrapper);
  li.appendChild(star);

  // Determine where to insert the new task (either at the top of the task list or completed list)
  if (isDone) {
    const firstCompletedTask = completedList.querySelector('li');
    if (firstCompletedTask) {
      completedList.insertBefore(li, firstCompletedTask);
    } else {
      completedList.appendChild(li);
    }
  } else {
    const firstTask = taskList.querySelector('li');
    if (firstTask) {
      taskList.insertBefore(li, firstTask);
    } else {
      taskList.appendChild(li);
    }
  }

  // Save the current state of tasks to local storage
  saveTasks();
}


// Displays the task options UI.
function showTaskOptions() {
    const taskOptions = document.getElementById('taskOptions');
    taskOptions.style.display = "flex";
}

// Hides the task options UI.
function hideTaskOptions() {
    const taskOptions = document.getElementById('taskOptions');
    taskOptions.style.display = "none";
}

// Initiates the task editing process
function editTask(event) {
  const span = event.currentTarget;
  const originalText = span.innerText; // Capture the original text

  span.contentEditable = true;
  span.focus();

  span.addEventListener('keydown', function(event) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault(); // Prevent newline
        saveTasks();      // Save changes and exit edit mode
        break;
      case 'Escape':
        span.innerText = originalText; // Revert to original text
        stopEditing(span);             // Exit edit mode
        break;
        case 'Backspace':
          if (span.textContent.trim() === '') {
            deleteTask(span.closest('li')); // Here, get the closest li element
          }
        break;
    }
  });
}

// Disables the editing mode for a given task.
function stopEditing(span) {
  span.contentEditable = false;
}

// Removes a task item from the task list.
function deleteTask(taskItem) {
  const taskList = document.getElementById('taskList');
  taskList.removeChild(taskItem);
  saveTasks(); // Save tasks after deletion
}

// Toggles the importance status of a task.
function toggleImportant(event) {
  const star = event.currentTarget;
  const taskItem = star.parentElement;

  if (taskItem.classList.contains('important')) {
    taskItem.classList.remove('important');
    star.innerText = '☆';  // Set to outlined star
    star.title = 'Mark as important';
  } else {
    taskItem.classList.add('important');
    star.innerText = '★';  // Set to filled star
    star.title = 'Unmark as important';
  }
}

/* For Completed Tasks */

// Toggles the task's status between done and not done.
function toggleDone(event) {
  const checkbox = event.currentTarget;
  const taskItem = checkbox.parentElement;
  const completedList = document.getElementById('completedList');
  const taskList = document.getElementById('taskList');

  if (checkbox.checked) {
    taskItem.classList.add('done');
    completedList.appendChild(taskItem);
  } else {
    taskItem.classList.remove('done');
    taskList.appendChild(taskItem);
  }
}

// Toggles the visibility of the completed task section.
function toggleCompletedList() {
  const completedSection = document.getElementById('completedSection');
  const toggleButton = document.getElementById('toggleCompleted');

  if (completedSection.style.display === 'none' || completedSection.style.display === '') {
      // If the completedSection is currently hidden or has no display value, show it
      completedSection.style.display = 'block';
      toggleButton.innerHTML = 'v'; // Change to "v" symbol
  } else {
      // If the completedSection is currently shown, hide it
      completedSection.style.display = 'none';
      toggleButton.innerHTML = '>'; // Change back to ">" symbol
  }
}

/* Saving and loading tasks from local storage */


// Save all tasks from both the task and completed lists to local storage.
function saveTasks() {
  const allTasks = [];

  // Save tasks from taskList
  document.querySelectorAll('#taskList li').forEach(taskElement => {
    const taskData = extractTaskData(taskElement);
    allTasks.push(taskData);
  });

  // Save tasks from completedList
  document.querySelectorAll('#completedList li').forEach(taskElement => {
    const taskData = extractTaskData(taskElement);
    allTasks.push(taskData);
  });

  localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// Extracts data from a task item element

function extractTaskData(taskElement) {
  const taskText = taskElement.querySelector('span:not(.star)').innerText;
  const isImportant = taskElement.classList.contains('important');
  const isDone = taskElement.classList.contains('done');

  return {
    text: taskText,
    important: isImportant,
    done: isDone
  };
}

// Loads tasks from local storage and renders them to the respective lists
function loadTasks() {
  const taskList = document.getElementById('taskList');
  const completedList = document.getElementById('completedList');

  // Clear existing tasks
  taskList.innerHTML = '';
  completedList.innerHTML = '';

  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  tasks.forEach(task => {
    addTask(task.text, task.important, task.done);
  });
}

// Delete all tasks

document.getElementById('deleteAllTasks').addEventListener('click', deleteAllTasks);

function deleteAllTasks() {
  const taskList = document.getElementById('taskList');
  const completedList = document.getElementById('completedList');

  // Clear tasks from the UI
  taskList.innerHTML = '';
  completedList.innerHTML = '';

  // Clear tasks from local storage
  localStorage.removeItem('tasks');
}

// Delete completed tasks

document.getElementById('deleteCompletedTasks').addEventListener('click', deleteAllCompletedTasks);


function deleteAllCompletedTasks() {
  const completedList = document.getElementById('completedList');

  // Clear completed tasks from the UI
  completedList.innerHTML = '';

  // Filter out completed tasks from local storage and update it
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const nonCompletedTasks = tasks.filter(task => !task.done);

  localStorage.setItem('tasks', JSON.stringify(nonCompletedTasks));
}


// Filter important tasks 

let showingOnlyImportant = false; 

function toggleImportantTasksDisplay(event) {
  event.preventDefault();  // To prevent the default anchor link action

  const allTasks = document.querySelectorAll('#taskList li');
  const myDayHeader = document.querySelector('.myDay-section h1');
  const myDayIcon = myDayHeader.querySelector('.material-symbols-outlined');


  if (showingOnlyImportant) {
      
      // Show all tasks
      allTasks.forEach(task => {
          task.style.display = '';
      });

      // Reset My Day text and symbol
      myDayIcon.textContent = 'sunny';
      myDayHeader.textContent = ' My Day';
      myDayHeader.prepend(myDayIcon);

      showingOnlyImportant = false;

  } else {

      // Show only important tasks
      allTasks.forEach(task => {
          if (task.classList.contains('important')) {
              task.style.display = '';  // Show important tasks
          } else {
              task.style.display = 'none';  // Hide non-important tasks
          }
      });

      // Change My Day text and symbol for important tasks
      myDayIcon.textContent = 'star';
      myDayHeader.textContent = ' Important Tasks';
      myDayHeader.prepend(myDayIcon);

      showingOnlyImportant = true;
  }
}

// Show all tasks 

document.getElementById('showAllTasks').addEventListener('click', toggleAllTasksDisplay);

function toggleAllTasksDisplay(event){
  const allTasks = document.querySelectorAll('#taskList li');
  const myDayHeader = document.querySelector('.myDay-section h1');
  const myDayIcon = myDayHeader.querySelector('.material-symbols-outlined');

  allTasks.forEach(task => {
  task.style.display = '';
  });

  myDayIcon.textContent = 'sunny';
  myDayHeader.textContent = ' My Day';
  myDayHeader.prepend(myDayIcon);

}

// hide and show left navigation 

document.getElementById('hideLeftNav').addEventListener('click', toggleHideLeftNav);

function toggleHideLeftNav(event){
  var leftNav = document.querySelector('.left-nav');
  leftNav.style.display = 'none';
  document.getElementById('showLeftNav').style.display = 'block'; 
}

document.getElementById('showLeftNav').addEventListener('click', function(event){
  setTimeout(toggleShowLeftNav, 50);
});

function toggleShowLeftNav(){
  var leftNav = document.querySelector('.left-nav');
  leftNav.style.display = 'block';
  document.getElementById('showLeftNav').style.display = 'none'; 
}

