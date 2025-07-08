'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/add', label: 'Add' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t flex justify-around p-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            'px-3 py-2 rounded ' +
            (pathname === item.href ? 'bg-blue-600 text-white' : 'text-blue-600')
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
