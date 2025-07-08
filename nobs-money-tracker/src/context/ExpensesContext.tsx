'use client';
import { createContext, useContext } from 'react';
import { useLocalStorage } from '../lib/useLocalStorage';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  date: string; // ISO
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id'>) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);

  function addExpense(e: Omit<Expense, 'id'>) {
    const newExp: Expense = { ...e, id: Date.now().toString() };
    setExpenses([...expenses, newExp]);
  }

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be inside ExpenseProvider');
  return ctx;
}
