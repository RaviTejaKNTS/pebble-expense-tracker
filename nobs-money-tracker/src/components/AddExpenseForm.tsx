'use client';
import { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';

const categories = ['Food', 'Transport', 'Shopping', 'Other'];

export default function AddExpenseForm({ onSaved }: { onSaved?: () => void }) {
  const { addExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function save() {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;
    addExpense({ amount: amt, category, note, date });
    setAmount('');
    setNote('');
    onSaved?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        autoFocus
        type="number"
        inputMode="decimal"
        placeholder="Amount"
        className="border p-2 rounded text-xl"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Note (optional)"
        className="border p-2 rounded"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <input
        type="date"
        className="border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white rounded p-2 text-lg"
        onClick={save}
      >
        Save
      </button>
    </div>
  );
}
