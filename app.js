const e = React.createElement;
const { useState, useEffect } = React;

function WidgetCard({ children }) {
  return e('div', { className: 'widget-card' }, children);
}

function SpentTodayWidget() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    function calc() {
      const today = new Date().toLocaleDateString('en-CA');
      const sum = (getExpenses() || [])
        .filter(exp => exp.date === today)
        .reduce((s, exp) => s + Number(exp.amount), 0);
      setTotal(sum);
    }
    calc();
    document.addEventListener('expensesUpdated', calc);
    return () => document.removeEventListener('expensesUpdated', calc);
  }, []);
  const symbol = getCurrency();
  return e(WidgetCard, null,
    e('small', { className: 'today-label' }, 'Spent Today'),
    e('div', { className: 'today-amount' }, symbol + total.toFixed(2))
  );
}

function WidgetGrid() {
  // For now only one widget but designed for dynamic widgets
  return e('div', { className: 'widget-grid' },
    e(SpentTodayWidget, null)
  );
}

function TransactionsList({ items }) {
  return e('ul', { className: 'transactions-list' },
    items.map(item =>
      e('li', { key: item.id },
        `${item.date} - ${item.category} ${getCurrency()}${Number(item.amount).toFixed(2)}`
      )
    )
  );
}

function TransactionsSection() {
  const [showAll, setShowAll] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    function load() {
      const all = (getExpenses() || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = new Date().toLocaleDateString('en-CA');
      setItems(showAll ? all : all.filter(i => i.date === today));
    }
    load();
    document.addEventListener('expensesUpdated', load);
    return () => document.removeEventListener('expensesUpdated', load);
  }, [showAll]);

  return e('div', { className: 'transactions-section' },
    e('div', { className: 'transactions-header' },
      e('h2', null, "Today's Categories"),
      e('button', { className: 'view-all-btn', onClick: () => setShowAll(v => !v) },
        showAll ? 'Close' : 'View All Transactions'
      )
    ),
    e(TransactionsList, { items })
  );
}

function App() {
  return e(React.Fragment, null,
    e(WidgetGrid, null),
    e(TransactionsSection, null)
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(e(App));
