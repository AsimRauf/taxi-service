import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

// Internal tool — English only by design.
const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/notifications?limit=1&unread=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Bell badge is best-effort — never break the layout over it
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, [fetchUnread]);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
      active: router.pathname === '/admin'
    },
    {
      label: 'Bookings',
      href: '/admin/bookings',
      icon: <BookOpen className="w-[18px] h-[18px]" />,
      active: router.pathname.startsWith('/admin/bookings')
    },
    {
      label: 'Notifications',
      href: '/admin/notifications',
      icon: (
        <span className="relative">
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] leading-4 text-center rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      ),
      active: router.pathname === '/admin/notifications'
    }
  ];

  const nav = (
    <nav className="space-y-1">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
            ? 'bg-primary text-white'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0b1e3b] px-4 py-6 shrink-0">
        <Link href="/admin" className="text-white font-bold text-lg px-3 mb-8">
          Taxi Ritje <span className="text-primary font-normal">Admin</span>
        </Link>
        {nav}
        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="px-3 text-xs text-gray-400 truncate mb-2">{user?.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#0b1e3b] flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="text-white font-bold">
          Taxi Ritje <span className="text-primary font-normal">Admin</span>
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} className="text-white p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#0b1e3b] pt-16 px-4">
          {nav}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
