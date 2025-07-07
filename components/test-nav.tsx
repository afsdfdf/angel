'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TestNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: '数据库测试', href: '/database-test' },
    { name: '用户测试', href: '/user-test' },
    { name: 'RPC测试', href: '/test-db-supabase-rpc' },
    { name: '主页', href: '/' },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-semibold">Angel Crypto 测试面板</span>
        </div>
        
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded ${
                pathname === item.href 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 