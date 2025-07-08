'use client';
import Link from 'next/link';
import { useExpenses } from '../context/ExpensesContext';

export default function Home() {
  const { expenses } = useExpenses();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <main className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Remaining Budget</h1>
      <div className="text-5xl font-bold">₹{total.toFixed(2)}</div>
      <Link href="/add" className="bg-blue-600 text-white rounded-full px-6 py-3 text-lg mt-4">+ Add Expense</Link>
      <ul className="w-full max-w-md mt-8">
        {expenses.slice().reverse().map((e) => (
          <li key={e.id} className="border-b py-2 flex justify-between">
            <span>{e.category}</span>
            <span>₹{e.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
