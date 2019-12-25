const $todoList = document.querySelector('.todo-list');
const $addTaskBtn = document.querySelector('.add-task-btn');
const $addTaskInput = document.querySelector('.add-task-input');
const $taskDeleteBtn = document.querySelectorAll('.task-delete-btn');
const $taskCompleteBtn = document.querySelectorAll('.task-complete-btn');
const $taskTemplate = document.querySelector('#task-template').content;

$addTaskBtn.addEventListener('click', onClickAddTask);
$taskDeleteBtn.forEach((item) => {
  item.addEventListener('click', onClickDeleteTask);
});
$taskCompleteBtn.forEach((item) => {
  item.addEventListener('click', onClickCompleteTask);
});

async function onClickAddTask() {
  try {
    const savedTask = await addTask({ title: $addTaskInput.value });
    const newTask = $taskTemplate;
    newTask.querySelector('.task-title').innerText = savedTask.title;
    newTask.querySelector('.task-container').dataset.id = savedTask._id;
    $todoList.append(newTask.cloneNode(true));
    $addTaskInput.value = '';
  } catch (err) {
    alert('Ошибка при добавлении');
  }
};

async function onClickDeleteTask(e) {
  e.preventDefault();
  const taskId = e.target.parentNode.dataset.id;
  try {
    await deleteTask(taskId);
    e.target.parentNode.remove();
  } catch (err) {
    alert('Ошибка при удалении');
  }
};

async function onClickCompleteTask(e) {
  e.preventDefault();
  const taskId = e.target.parentNode.dataset.id;
  e.target.parentNode.querySelector('.task-status').classList.add('task-status_completed');
  e.target.remove();
  try {
    await updateTask(taskId, { completed: true });
  } catch (err) {
    alert('Ошибка при изменении статуса');
  }
};

async function addTask(data) {
  const response = await fetch('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(data),
  });
  const savedTask = await response.json();
  return savedTask;
};


async function deleteTask(id) {
  const response = await fetch('/tasks', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id}),
  });

  return response;
};

async function updateTask(id, payload) {
  const response = await fetch(`/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const updatedTask = await response.json();
  return updatedTask;
};
