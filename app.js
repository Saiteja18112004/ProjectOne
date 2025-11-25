const state = {
  tasks: [],        
  filter: 'all',             
  theme: localStorage.getItem('theme') || 'dark'
};

const els = {
  themeToggle: document.getElementById('themeToggle'),
  search: document.getElementById('search'),
  newForm: document.getElementById('newTaskForm'),
  taskInput: document.getElementById('taskInput'),
  priorityInput: document.getElementById('priorityInput'),
  list: document.getElementById('taskList'),
  filters: document.querySelector('.filters'),
  clearCompleted: document.getElementById('clearCompleted'),
  tpl: document.getElementById('taskTemplate')
};

// Initialize
document.body.classList.toggle('light', state.theme === 'light');
document.addEventListener('DOMContentLoaded', () => {
  load();
  render();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'n') els.taskInput.focus();
});

// ---- Storage helpers ----
function save(){
  localStorage.setItem('tasks', JSON.stringify(state.tasks));
  localStorage.setItem('theme', state.theme);
}
function load(){
  try {
    const raw = localStorage.getItem('tasks');
    state.tasks = raw ? JSON.parse(raw) : [];
  } catch { state.tasks = []; }
}

// ---- CRUD ----
function addTask(title, priority){
  state.tasks.push({
    id: crypto.randomUUID(),
    title: title.trim(),
    priority,
    completed: false
  });
  save(); render();
}
function updateTask(id, patch){
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  Object.assign(t, patch);
  save(); render();
}
function deleteTask(id){
  state.tasks = state.tasks.filter(x => x.id !== id);
  save(); render();
}
function clearCompleted(){
  state.tasks = state.tasks.filter(x => !x.completed);
  save(); render();
}

// ---- Rendering ----
function render(){
  // Filter + search
  const q = els.search.value.trim().toLowerCase();
  const filtered = state.tasks.filter(t => {
    const hitsFilter =
      state.filter === 'all' ||
      (state.filter === 'active' && !t.completed) ||
      (state.filter === 'completed' && t.completed);
    const hitsSearch = !q || t.title.toLowerCase().includes(q);
    return hitsFilter && hitsSearch;
  });

  els.list.innerHTML = '';
  filtered.forEach(t => {
    const node = els.tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = t.id;
    if (t.completed) node.classList.add('completed');

    node.querySelector('.task-complete').checked = t.completed;
    node.querySelector('.task-title').textContent = t.title;
    const pill = node.querySelector('.priority-pill');
    pill.textContent = t.priority;
    pill.classList.add(t.priority);

    // handlers
    node.querySelector('.task-complete').addEventListener('change', (e) => {
      updateTask(t.id, { completed: e.target.checked });
    });

    node.querySelector('.edit').addEventListener('click', () => {
      node.classList.add('editing');
      const edit = node.querySelector('.task-edit');
      edit.value = t.title;
      edit.focus();
    });

    node.querySelector('.save').addEventListener('click', () => {
      const editVal = node.querySelector('.task-edit').value;
      if (editVal.trim().length) updateTask(t.id, { title: editVal.trim() });
      node.classList.remove('editing');
    });

    node.querySelector('.task-edit').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        node.querySelector('.save').click();
      }
    });

    node.querySelector('.delete').addEventListener('click', () => deleteTask(t.id));

    els.list.appendChild(node);
  });
}

// ---- UI events ----
els.newForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = els.taskInput.value;
  const priority = els.priorityInput.value;
  if (!title.trim()) return;
  addTask(title, priority);
  els.taskInput.value = '';
});

els.filters.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  els.filters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.filter = btn.dataset.filter;
  render();
});

els.clearCompleted.addEventListener('click', clearCompleted);


els.themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light', state.theme === 'light');
  save();
}); 

