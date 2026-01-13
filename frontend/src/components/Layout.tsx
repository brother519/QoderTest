import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Link2, 
  Key, 
  LogOut,
  Plus
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/links', label: 'Links', icon: Link2 },
  { path: '/api-keys', label: 'API Keys', icon: Key },
];

export default function Layout({ children }: LayoutProps) {
  const { setApiKey } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    setApiKey(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link2 className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">URL Shortener</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Create Link Button */}
          <div className="border-t px-3 py-4">
            <Link
              to="/links/new"
              className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t px-3 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
