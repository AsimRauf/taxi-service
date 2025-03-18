import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, BookOpen, Clock } from 'react-feather';
import { useTranslation } from 'next-i18next';

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout: FC<AccountLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const navItems = [
    { 
      label: t('nav.viewAll'), 
      href: '/account/bookings', 
      icon: <BookOpen size={18} />,
      active: router.pathname === '/account/bookings'
    },
    {
      label: t('nav.upcomingRides'),
      href: '/account/upcoming',
      icon: <Clock size={18} />,
      active: router.pathname === '/account/upcoming'
    },
    { 
      label: t('nav.profile'), 
      href: '/account/profile', 
      icon: <User size={18} />,
      active: router.pathname === '/account/profile'
    },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-[76px] xs:pt-[84px] sm:pt-[92px] bg-gray-50">
        <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 xs:gap-6 sm:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 sticky top-[92px]">
              <div className="bg-white rounded-xl shadow-sm border border-secondary/20 overflow-hidden">
                <div className="p-4 sm:p-6 bg-secondary text-white">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('nav.myAccount')}</h2>
                </div>
                <nav className="p-3">
                  <ul className="space-y-1.5">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            item.active 
                              ? 'bg-primary text-secondary font-medium' 
                              : 'text-gray-600 hover:bg-primary/10 hover:text-secondary'
                          }`}
                        >
                          <span className="mr-2.5">{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Mobile Navigation Pills */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-full whitespace-nowrap text-sm ${
                    item.active 
                      ? 'bg-primary text-secondary font-medium' 
                      : 'bg-white text-gray-600 hover:bg-primary/10 hover:text-secondary'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow-sm border border-secondary/20 p-3 xs:p-4 sm:p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
