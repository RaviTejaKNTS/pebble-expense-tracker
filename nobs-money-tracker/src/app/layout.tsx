import type { Metadata } from 'next';
import './globals.css';
import { ExpenseProvider } from '../context/ExpensesContext';
import NavBar from '../components/NavBar';

export const metadata: Metadata = {
  title: 'No BS Money Tracker',
  description: 'Track your money in seconds. No ads. No nonsense.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased p-4 pb-16">
        <ExpenseProvider>
          {children}
          <NavBar />
        </ExpenseProvider>
      </body>
    </html>
  );
}
