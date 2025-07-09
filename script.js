function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  } catch {
    return [];
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
  const date = document.getElementById('date').value || new Date().toISOString().slice(0,10);
  const expenses = getExpenses();
  expenses.push({ id: Date.now().toString(), amount, category, note, date });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  togglePopup(false);
  showExpenses();
}

function togglePopup(open) {
  const wrapper = document.querySelector('.fab-wrapper');
  if (!wrapper) return;
  if (typeof open === 'boolean') {
    wrapper.classList.toggle('open', open);
  } else {
    wrapper.classList.toggle('open');
  }
}

function init() {
  showExpenses();
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', saveExpense);
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0,10);
    }
  }
  const fab = document.getElementById('fab');
  if (fab) {
    fab.addEventListener('click', () => togglePopup());
  }
  const closeBtn = document.getElementById('close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => togglePopup(false));
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.querySelector('.fab-wrapper').classList.contains('open')) {
      togglePopup(false);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
