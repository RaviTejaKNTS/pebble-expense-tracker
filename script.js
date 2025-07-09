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

document.addEventListener('DOMContentLoaded', showExpenses);
