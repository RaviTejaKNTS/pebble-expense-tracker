function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  } catch {
    return [];
  }
}

let selectedDate = new Date().toISOString().slice(0, 10);

function updateDateDisplay() {
  const disp = document.getElementById('date-display');
  if (disp) {
    disp.textContent = selectedDate;
  }
}

function showCalendar() {
  const view = document.getElementById('calendar-view');
  const fields = document.querySelector('.form-fields');
  const picker = document.getElementById('date-picker');
  if (view && fields && picker) {
    fields.hidden = true;
    view.hidden = false;
    picker.value = selectedDate;
    setTimeout(() => picker.focus(), 0);
  }
}

function hideCalendar(value) {
  const view = document.getElementById('calendar-view');
  const fields = document.querySelector('.form-fields');
  if (view && fields) {
    if (value) {
      selectedDate = value;
      updateDateDisplay();
    }
    view.hidden = true;
    fields.hidden = false;
  }
}

function showExpenses() {
  const list = document.getElementById('list');
  const totalEl = document.getElementById('total');
  const expenses = getExpenses();
  let total = 0;
  list.innerHTML = '';
  expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      total += e.amount;
      const li = document.createElement('li');
      li.innerHTML = `<span>${e.date} - ${e.category}</span><span>₹${e.amount.toFixed(2)}</span>`;
      list.appendChild(li);
    });
  totalEl.textContent = `₹${total.toFixed(2)}`;
}

function saveExpense(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  if (isNaN(amount)) return;
  const category = document.getElementById('category').value;
  const note = document.getElementById('note').value;
  const date = selectedDate;
  const expenses = getExpenses();
  expenses.push({ id: Date.now().toString(), amount, category, note, date });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  togglePopup(false);
  showExpenses();
}

function togglePopup(open) {
  const wrapper = document.querySelector('.fab-wrapper');
  if (!wrapper) return;
  const willOpen = typeof open === 'boolean' ? open : !wrapper.classList.contains('open');
  wrapper.classList.toggle('open', willOpen);
  if (willOpen) {
    updateDateDisplay();
    setTimeout(() => {
      const amount = document.getElementById('amount');
      if (amount) amount.focus();
    }, 0);
  }
}

function init() {
  showExpenses();
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', saveExpense);
  }
  updateDateDisplay();
  const dateBtn = document.getElementById('date-display');
  const picker = document.getElementById('date-picker');
  if (dateBtn && picker) {
    dateBtn.addEventListener('click', showCalendar);
    picker.addEventListener('change', e => hideCalendar(e.target.value));
  }

  const order = ['amount', 'category', 'note', 'date-display', 'save-btn'];
  order.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowDown' && order[idx + 1]) {
        const next = document.getElementById(order[idx + 1]);
        if (next) next.focus();
      }
    });
  });
  const fab = document.getElementById('fab');
  if (fab) {
    fab.addEventListener('click', () => togglePopup());
  }
  const closeBtn = document.getElementById('close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => togglePopup(false));
  }
  document.addEventListener('keydown', e => {
    const wrapperOpen = document.querySelector('.fab-wrapper').classList.contains('open');
    if (e.key === 'Escape' && wrapperOpen) {
      const view = document.getElementById('calendar-view');
      if (view && !view.hidden) {
        hideCalendar();
      } else {
        togglePopup(false);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
