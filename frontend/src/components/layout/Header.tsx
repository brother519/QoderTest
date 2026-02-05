import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../hooks/useAuth';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">ShortLink</span>
          </Link>

          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/links"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Links
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
