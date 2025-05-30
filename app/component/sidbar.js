'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/userContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Daily Entry', href: '/daily-entry' },
        { name: 'Learnings', href: '/learnings' },
        { name: 'Comparison', href: '/comparison' },
        { name: 'Timers', href: '/timers' }
    ];

    return (
        <div className="sticky h-screen top-0 left-0 w-64 bg-white border-r border-gray-100 shadow-sm">
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-8 text-gray-900 tracking-tight">
                    Optimize
                </h1>

                <div className="mb-8">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Current User
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        {user || 'Select a user'}
                    </p>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === item.href
                                ? 'bg-blue-50 text-blue-700 border-l-3 border-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Subtle gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>
    );
}