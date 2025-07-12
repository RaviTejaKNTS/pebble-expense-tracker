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

function getBudgetAmount() {
  const val = parseFloat(localStorage.getItem('budgetAmount') || '0');
  return isNaN(val) ? 0 : val;
}

function getEnabledWidgets() {
  try {
    return JSON.parse(localStorage.getItem('widgets') || '[]');
  } catch {
    return [];
  }
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

function formatAmountParts(val) {
  const str = val.toFixed(2);
  const [intPart, decPart] = str.split('.');
  return { intPart, decPart };
}

function setAmount(element, amount) {
  if (!element) return;
  const symbol = getCurrency();
  const { intPart, decPart } = formatAmountParts(amount);
  element.innerHTML = `${symbol}<span class="amount-int">${intPart}</span><span class="amount-dec">.${decPart}</span>`;
  fitAmount(element);
}

function fitAmount(el) {
  if (!el || !el.parentElement) return;
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  const min = 16;
  while (el.scrollWidth > el.parentElement.clientWidth && size > min) {
    size -= 1;
    el.style.fontSize = size + 'px';
  }
}

let selectedDate = new Date();
let currentCalMonth = new Date();
let selectedCategory = 'Food';
let viewAllTransactions = false;

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

function showExpenses(showAll = false) {
  const list = document.getElementById('list');
  const totalEl = document.getElementById('total');
  const monthlyEl = document.getElementById('monthly-total');
  const budgetEl = document.getElementById('budget-remaining');
  if (!list || !totalEl) return;
  const expenses = getExpenses();
  const symbol = getCurrency();
  let todayTotal = 0;
  let monthTotal = 0;
  const today = new Date().toLocaleDateString('en-CA');
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  list.innerHTML = '';
  expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      if (e.date === today) {
        todayTotal += e.amount;
      }
      const parts = e.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (y === curYear && m === curMonth) {
          monthTotal += e.amount;
        }
      }
      if (!showAll && e.date !== today) return;
      const li = document.createElement('li');
      li.className = 'expense-item';
      li.dataset.id = e.id;

      const summary = document.createElement('div');
      summary.className = 'item-summary';
      summary.innerHTML = `<span>${e.date} - ${e.category}</span><span>${symbol}${e.amount.toFixed(2)}</span>`;
      li.appendChild(summary);


      const details = document.createElement('div');
      details.className = 'item-details';
      details.innerHTML = `
        <div class="form-fields">
          <input type="number" class="edit-amount" value="${e.amount}">
          <div class="category-select">
            <button type="button" class="edit-cat-btn select-btn">${e.category}</button>
            <div class="chip-menu edit-cat-menu" hidden>
              <button type="button" class="chip" data-value="Food">Food</button>
              <button type="button" class="chip" data-value="Transport">Transport</button>
              <button type="button" class="chip" data-value="Shopping">Shopping</button>
              <button type="button" class="chip" data-value="Other">Other</button>
            </div>
          </div>
          <input type="text" class="edit-note" placeholder="Note" value="${e.note || ''}">
          <button type="button" class="edit-date-btn calendar-btn">📅 <span class="edit-date-display"></span></button>
          <div class="calendar-view edit-cal-view">
            <div class="calendar-header">
              <button type="button" class="cal-nav edit-prev-month">‹</button>
              <span class="edit-cal-month"></span>
              <button type="button" class="cal-nav edit-next-month">›</button>
            </div>
            <div class="calendar-grid edit-cal-grid"></div>
          </div>
          <div class="actions">
            <button type="button" class="delete-btn">Delete</button>
            <button type="button" class="save-btn">Save</button>
          </div>
        </div>`;
      li.appendChild(details);

      summary.addEventListener('click', () => {
        document.querySelectorAll('.expense-item.expanded').forEach(other => {
          if (other !== li) other.classList.remove('expanded');
        });
        li.classList.toggle('expanded');
      });

      initEditItem(li, e);

      list.appendChild(li);
    });
  setAmount(totalEl, todayTotal);
  if (monthlyEl) setAmount(monthlyEl, monthTotal);
  if (budgetEl) {
    const remaining = getBudgetAmount() - monthTotal;
    setAmount(budgetEl, remaining);
  }
}

function applyWidgetSettings() {
  const widgets = getEnabledWidgets();
  const monthlySummary = document.getElementById('monthly-summary');
  const budgetSummary = document.getElementById('budget-summary');
  if (monthlySummary) monthlySummary.hidden = !widgets.includes('monthly');
  if (budgetSummary) budgetSummary.hidden = !widgets.includes('budget');
  if (monthlySummary && !monthlySummary.hidden) {
    fitAmount(monthlySummary.querySelector('.today-amount'));
  }
  if (budgetSummary && !budgetSummary.hidden) {
    fitAmount(budgetSummary.querySelector('.today-amount'));
  }
}

function updateExpense(id, amount, category, note, date) {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  if (!isNaN(amount)) expenses[idx].amount = amount;
  expenses[idx].category = category;
  expenses[idx].note = note;
  expenses[idx].date = date;
  localStorage.setItem('expenses', JSON.stringify(expenses));
  showExpenses(viewAllTransactions);
}

function deleteExpense(id) {
  const expenses = getExpenses().filter(e => e.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  showExpenses(viewAllTransactions);
}

function initEditItem(li, expense) {
  const details = li.querySelector('.item-details');
  if (!details) return;

  const amountInput = details.querySelector('.edit-amount');
  const noteInput = details.querySelector('.edit-note');
  const catBtn = details.querySelector('.edit-cat-btn');
  const catMenu = details.querySelector('.edit-cat-menu');
  const calendarBtn = details.querySelector('.edit-date-btn');
  const calendarView = details.querySelector('.edit-cal-view');
  const calMonth = details.querySelector('.edit-cal-month');
  const calGrid = details.querySelector('.edit-cal-grid');
  const prevMonth = details.querySelector('.edit-prev-month');
  const nextMonth = details.querySelector('.edit-next-month');

  let selectedDate = new Date(expense.date);
  let currentMonth = new Date(selectedDate);

  function updateDateDisplay() {
    const span = calendarBtn.querySelector('.edit-date-display');
    if (span) span.textContent = selectedDate.toLocaleDateString('en-CA');
  }

  function buildCal() {
    calGrid.innerHTML = '';
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    calMonth.textContent = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      calGrid.appendChild(document.createElement('div'));
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
        calendarView.classList.remove('open');
        updateDateDisplay();
      });
      calGrid.appendChild(btn);
    }
  }

  calendarBtn.addEventListener('click', () => {
    const open = calendarView.classList.contains('open');
    calendarView.classList.toggle('open', !open);
    if (!open) {
      currentMonth = new Date(selectedDate);
      buildCal();
    }
  });
  prevMonth.addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); buildCal(); });
  nextMonth.addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); buildCal(); });

  updateDateDisplay();

  catBtn.addEventListener('click', () => { catMenu.hidden = !catMenu.hidden; });
  catMenu.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      catBtn.textContent = chip.dataset.value;
      catMenu.hidden = true;
    });
  });
  document.addEventListener('click', e => {
    if (!catBtn.contains(e.target) && !catMenu.contains(e.target)) {
      catMenu.hidden = true;
    }
  });

  const delBtn = details.querySelector('.delete-btn');
  const saveBtn = details.querySelector('.save-btn');
  delBtn.addEventListener('click', () => deleteExpense(expense.id));
  saveBtn.addEventListener('click', () => {
    const newAmount = parseFloat(amountInput.value);
    const newCat = catBtn.textContent.trim() || expense.category;
    const newDate = selectedDate.toLocaleDateString('en-CA');
    const newNote = noteInput.value;
    updateExpense(expense.id, newAmount, newCat, newNote, newDate);
  });
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
  showExpenses(viewAllTransactions);
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
  const budgetInput = document.getElementById('budget-input');
  const monthlyChk = document.getElementById('widget-monthly-setting');
  const budgetChk = document.getElementById('widget-budget-setting');
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

  if (budgetInput) budgetInput.value = getBudgetAmount() || '';
  const enabled = getEnabledWidgets();
  if (monthlyChk) monthlyChk.checked = enabled.includes('monthly');
  if (budgetChk) budgetChk.checked = enabled.includes('budget');

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
    if (budgetInput) {
      const val = parseFloat(budgetInput.value);
      if (!isNaN(val)) {
        localStorage.setItem('budgetAmount', val.toString());
      }
    }
    const widgetList = [];
    if (monthlyChk && monthlyChk.checked) widgetList.push('monthly');
    if (budgetChk && budgetChk.checked) widgetList.push('budget');
    localStorage.setItem('widgets', JSON.stringify(widgetList));
    if (saveIcon) {
      saveIcon.textContent = '✔';
      saveIcon.className = 'save-icon show';
      setTimeout(() => {
        saveIcon.className = 'save-icon';
        saveIcon.textContent = '';
      }, 1000);
    }
    showExpenses(viewAllTransactions);
    applyWidgetSettings();
  });
}

function initSidebarNav() {
  const links = document.querySelectorAll('.sidebar a[data-page]');
  const sidebar = document.querySelector('.sidebar');
  const content = document.getElementById('sidebar-content');
  const closeBtn = document.getElementById('close-sidebar');
  if (!sidebar || !links.length || !content) return;

  function closeSidebar() {
    sidebar.classList.remove('expanded', 'show-page');
    content.innerHTML = '';
    links.forEach(l => l.classList.toggle('active', l.dataset.page === 'home'));
    if (closeBtn) closeBtn.hidden = true;
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      links.forEach(l => l.classList.toggle('active', l === link));
      if (page === 'home') {
        closeSidebar();
      } else {
        const tmpl = document.getElementById('tmpl-' + page);
        if (tmpl) {
          content.innerHTML = tmpl.innerHTML;
          sidebar.classList.add('expanded', 'show-page');
          if (closeBtn) closeBtn.hidden = false;
          if (page === 'settings') initSettings();
        }
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }
}

function init() {
  showExpenses(viewAllTransactions);
  applyWidgetSettings();
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

  const toggleBtn = document.getElementById('toggle-transactions');
  const txSection = document.getElementById('transactions-section');
  const txTitle = document.querySelector('.transactions-title');
  const closeTx = document.getElementById('close-transactions');
  function openTransactions() {
    viewAllTransactions = true;
    txSection.classList.add('fullscreen');
    txTitle.textContent = 'All Transactions';
    showExpenses(true);
  }
  function closeTransactions() {
    viewAllTransactions = false;
    txSection.classList.remove('fullscreen');
    txTitle.textContent = "Today's Spends";
    showExpenses(false);
  }
  if (toggleBtn && txSection && txTitle && closeTx) {
    toggleBtn.addEventListener('click', openTransactions);
    closeTx.addEventListener('click', closeTransactions);
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

  initSidebarNav();
}

document.addEventListener('DOMContentLoaded', init);
