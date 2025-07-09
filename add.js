function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  } catch {
    return [];
  }
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
  window.location.href = 'index.html';
}

document.getElementById('expense-form').addEventListener('submit', saveExpense);

// default date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  dateInput.value = new Date().toISOString().slice(0,10);
}
