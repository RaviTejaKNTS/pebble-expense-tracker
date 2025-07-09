function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  } catch {
    return [];
  }
}

function getCurrency() {
  return localStorage.getItem('currencySymbol') || '₹';
}

function getSymbolFromCode(code) {
  try {
    return Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol'
    })
      .format(0)
      .replace(/[\d\s.,]/g, '');
  } catch {
    return code;
  }
}

let selectedDate = new Date();
let currentCalMonth = new Date();
let selectedCategory = 'Food';

function resetForm() {
  const amount = document.getElementById('amount');
  const note = document.getElementById('note');
  selectedDate = new Date();
  selectedCategory = 'Food';
  if (amount) amount.value = '';
  if (note) note.value = '';
  const menu = document.getElementById('category-menu');
  if (menu) {
    const chips = menu.querySelectorAll('.chip');
    chips.forEach(chip => chip.classList.toggle('selected', chip.dataset.value === selectedCategory));
    menu.hidden = true;
  }
  const view = document.getElementById('calendar-view');
  if (view) view.classList.remove('open');
  updateDateDisplay();
  updateCategoryDisplay();
}

function updateCategoryDisplay() {
  const catBtn = document.getElementById('category-btn');
  if (catBtn) catBtn.textContent = selectedCategory;
}

function updateDateDisplay() {
  const disp = document.getElementById('date-display');
  if (disp) {
    disp.textContent = selectedDate.toLocaleDateString('en-CA');
  }
}

function buildCalendar() {
  const grid = document.getElementById('cal-grid');
  const monthLabel = document.getElementById('cal-month');
  if (!grid || !monthLabel) return;
  grid.innerHTML = '';
  const year = currentCalMonth.getFullYear();
  const month = currentCalMonth.getMonth();
  monthLabel.textContent = currentCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    grid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = d;
    btn.className = 'calendar-day';
    if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && d === selectedDate.getDate()) {
      btn.classList.add('selected');
    }
    btn.addEventListener('click', () => {
      selectedDate = new Date(year, month, d);
      toggleCalendar(false);
      updateDateDisplay();
    });
    grid.appendChild(btn);
  }
}

function toggleCalendar(forceOpen) {
  const view = document.getElementById('calendar-view');
  if (!view) return;
  const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !view.classList.contains('open');
  view.classList.toggle('open', willOpen);
  if (willOpen) {
    currentCalMonth = new Date(selectedDate);
    buildCalendar();
  }
}

function showExpenses() {
  const list = document.getElementById('list');
  const totalEl = document.getElementById('total');
  if (!list || !totalEl) return;
  const expenses = getExpenses();
  const symbol = getCurrency();
  let todayTotal = 0;
  const today = new Date().toLocaleDateString('en-CA');
  list.innerHTML = '';
  expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      if (e.date === today) {
        todayTotal += e.amount;
      }
      const li = document.createElement('li');
      li.innerHTML = `<span>${e.date} - ${e.category}</span><span>${symbol}${e.amount.toFixed(2)}</span>`;
      list.appendChild(li);
    });
  totalEl.textContent = `${symbol}${todayTotal.toFixed(2)}`;
}

function saveExpense(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  if (isNaN(amount)) return;
  const note = document.getElementById('note').value;
  const date = selectedDate.toLocaleDateString('en-CA');
  const expenses = getExpenses();
  expenses.push({ id: Date.now().toString(), amount, category: selectedCategory, note, date });
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
    resetForm();
    setTimeout(() => {
      const amount = document.getElementById('amount');
      if (amount) amount.focus();
    }, 0);
  } else {
    const menu = document.getElementById('category-menu');
    if (menu) menu.hidden = true;
    const view = document.getElementById('calendar-view');
    if (view) view.classList.remove('open');
    wrapper.classList.add('closing');
    setTimeout(() => wrapper.classList.remove('closing'), 400);
  }
}

function initSettings() {
  const form = document.getElementById('settings-form');
  const btn = document.getElementById('currency-btn');
  const menu = document.getElementById('currency-menu');
  const search = document.getElementById('currency-search');
  const opts = document.getElementById('currency-options');
  const saveIcon = document.getElementById('save-icon');
  if (!form || !btn || !menu || !search || !opts) return;

  let codes = [];
  if (Intl.supportedValuesOf) {
    codes = Intl.supportedValuesOf('currency');
  }
  const currencies = codes.map(c => ({ code: c, symbol: getSymbolFromCode(c) }));
  let selected = getCurrency();

  function formatLabel(item) {
    return `${item.code} (${item.symbol})`;
  }

  function renderOptions(filter = '') {
    opts.innerHTML = '';
    currencies.forEach(item => {
      const label = formatLabel(item);
      if (label.toLowerCase().includes(filter.toLowerCase())) {
        const div = document.createElement('div');
        div.className = 'currency-option';
        if (item.symbol === selected) div.classList.add('selected');
        div.textContent = label;
        div.addEventListener('click', () => {
          selected = item.symbol;
          btn.textContent = label;
          menu.hidden = true;
        });
        opts.appendChild(div);
      }
    });
  }

  const currentItem = currencies.find(i => i.symbol === selected) || currencies[0];
  if (currentItem) {
    btn.textContent = formatLabel(currentItem);
  }
  renderOptions();

  btn.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    if (!menu.hidden) {
      search.value = '';
      renderOptions();
      search.focus();
    }
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.hidden = true;
    }
  });

  search.addEventListener('input', () => renderOptions(search.value));

  form.addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem('currencySymbol', selected);
    if (saveIcon) {
      saveIcon.textContent = '';
      saveIcon.className = 'save-icon loading';
      setTimeout(() => {
        saveIcon.className = 'save-icon check';
        saveIcon.textContent = '✔';
        setTimeout(() => {
          saveIcon.className = 'save-icon';
          saveIcon.textContent = '';
        }, 1500);
      }, 800);
    }
  });
}

function init() {
  showExpenses();
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', saveExpense);
  }
  updateDateDisplay();
  updateCategoryDisplay();
  const dateBtn = document.getElementById('calendar-btn');
  if (dateBtn) {
    dateBtn.addEventListener('click', () => toggleCalendar());
  }
  const prev = document.getElementById('prev-month');
  const next = document.getElementById('next-month');
  if (prev && next) {
    prev.addEventListener('click', () => { currentCalMonth.setMonth(currentCalMonth.getMonth() - 1); buildCalendar(); });
    next.addEventListener('click', () => { currentCalMonth.setMonth(currentCalMonth.getMonth() + 1); buildCalendar(); });
  }

  const catBtn = document.getElementById('category-btn');
  const menu = document.getElementById('category-menu');
  if (catBtn && menu) {
    catBtn.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
    });
    const chips = menu.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        selectedCategory = chip.dataset.value;
        updateCategoryDisplay();
        menu.hidden = true;
        chips.forEach(c => c.classList.toggle('selected', c === chip));
      });
    });
    document.addEventListener('click', e => {
      if (!catBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.hidden = true;
      }
    });
  }

  const order = ['amount', 'category-btn', 'note', 'calendar-btn', 'save-btn'];
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
      if (view && view.classList.contains('open')) {
        toggleCalendar(false);
      } else {
        togglePopup(false);
      }
    }
  });

  initSettings();
}

document.addEventListener('DOMContentLoaded', init);
