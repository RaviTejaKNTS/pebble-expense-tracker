'use client';
import { useRouter } from 'next/navigation';
import AddExpenseForm from '../../components/AddExpenseForm';

export default function AddPage() {
  const router = useRouter();
  return (
    <main className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
      <AddExpenseForm onSaved={() => router.push('/')} />
    </main>
  );
}
