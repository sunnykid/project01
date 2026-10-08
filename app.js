const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("todo-count");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filters button");

let todos = loadTodos();
let filter = "all";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, completed: false });
  update();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  update();
}

function editTodo(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  if (text) todo.text = text;
  else todos = todos.filter((t) => t.id !== id);
  update();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  update();
}

function update() {
  saveTodos();
  render();
}

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  list.innerHTML = "";
  const items = visibleTodos();

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "할 일이 없습니다.";
    list.appendChild(empty);
  }

  for (const todo of items) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = todo.text;
    text.title = "더블클릭하여 수정";

    const del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.setAttribute("aria-label", "삭제");
    del.textContent = "×";

    li.append(checkbox, text, del);
    list.appendChild(li);
  }

  const remaining = todos.filter((t) => !t.completed).length;
  count.textContent = `남은 할 일 ${remaining}개`;
  clearBtn.hidden = !todos.some((t) => t.completed);
}

function startEditing(li) {
  const id = li.dataset.id;
  const todo = todos.find((t) => t.id === id);
  const span = li.querySelector(".text");

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = todo.text;
  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let done = false;
  const finish = (save) => {
    if (done) return;
    done = true;
    if (save) editTodo(id, editInput.value.trim());
    else render();
  };

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    else if (e.key === "Escape") finish(false);
  });
  editInput.addEventListener("blur", () => finish(true));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

list.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") toggleTodo(e.target.closest("li").dataset.id);
});

list.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) deleteTodo(e.target.closest("li").dataset.id);
});

list.addEventListener("dblclick", (e) => {
  if (e.target.classList.contains("text")) startEditing(e.target.closest("li"));
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  update();
});

render();
