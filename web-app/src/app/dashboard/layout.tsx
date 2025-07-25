'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  LogOut, 
  BookOpen, 
  Receipt, 
  Target,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  ChevronLeft
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions'
  },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: Receipt,
    description: 'Invoice generation and management'
  },
  {
    name: 'Chart of Accounts',
    href: '/dashboard/accounts',
    icon: BookOpen,
    description: 'Manage financial accounts'
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: Receipt,
    description: 'Create and manage transactions'
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Building,
    description: 'Customer database management'
  },
  {
    name: 'Contacts',
    href: '/dashboard/contacts',
    icon: Users,
    description: 'Contact relationship management'
  },
  {
    name: 'Leads',
    href: '/dashboard/leads',
    icon: Target,
    description: 'Lead tracking and sales'
  },
  {
    name: 'Debug',
    href: '/dashboard/debug',
    icon: Activity,
    description: 'System diagnostics',
    badge: 'Dev'
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  function getDisplayName(user: any) {
    if (!user) return "";
    if (user.fullName && user.fullName.trim() !== "") return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.id;
  }
  const { user, logout } = useRequireAuth();

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<null | 'settings' | 'help' | 'profile'>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the user menu button or dropdown
      const target = event.target as Element;
      if (target.closest('[data-user-menu]')) {
        return;
      }
      setUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setUserMenuOpen(false);
        setComingSoonModal(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" aria-hidden="true"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const currentPage = navigation.find(item => isActive(item.href));
    if (!currentPage) return [];
    
    const breadcrumbs = [
      { name: 'Dashboard', href: '/dashboard' }
    ];
    
    if (currentPage.href !== '/dashboard') {
      breadcrumbs.push({ name: currentPage.name, href: currentPage.href });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Go to dashboard home"
            >
              <BarChart3 className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <span className="text-xl font-bold">Continuo</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-describedby={active ? 'current-page-description' : undefined}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} aria-hidden="true" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {navigation.some(item => isActive(item.href)) && (
              <div id="current-page-description" className="sr-only">
                Current page
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center" aria-hidden="true">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getDisplayName(user)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role} - {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200" role="banner" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Breadcrumb navigation */}
            <nav className="flex-1 lg:flex-none" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 mx-2 text-gray-400" aria-hidden="true" />
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-semibold text-gray-900" aria-current="page">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-gray-600 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Help link */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setComingSoonModal('help')}
                  className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Help and support"
                >
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Help (Coming Soon)
                </div>
              </div>

              {/* Settings link */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setComingSoonModal('settings')}
                  className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Settings (Coming Soon)
                </div>
              </div>

              {/* User menu */}
              <div className="relative" style={{ position: 'relative', zIndex: 1000 }} data-user-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]"
                    style={{ minWidth: '14rem' }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    data-user-menu
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{getDisplayName(user)}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={e => { e.preventDefault(); setComingSoonModal('profile'); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={e => { e.preventDefault(); setComingSoonModal('settings'); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-auto p-6" role="main">
          {children}
        </main>
      </div>

      {/* Close user menu when clicking outside */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Shared Coming Soon Modal */}
      {comingSoonModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 id="modal-title" className="text-xl font-bold mb-4 text-gray-900">
              {comingSoonModal === 'settings' && 'Settings Coming Soon'}
              {comingSoonModal === 'help' && 'Help & Support Coming Soon'}
              {comingSoonModal === 'profile' && 'User Profile Coming Soon'}
            </h2>
            <p className="mb-6 text-gray-700">
              {comingSoonModal === 'settings' && 'User profile and application settings will be available in a future update. Stay tuned for customization options, security settings, and more!'}
              {comingSoonModal === 'help' && 'Help and support resources will be available soon, including documentation, FAQs, and contact options.'}
              {comingSoonModal === 'profile' && 'User profile management will be available soon, including editing your information, changing your password, and more.'}
            </p>
            <button
              onClick={() => setComingSoonModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 