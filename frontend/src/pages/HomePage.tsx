import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LinkCreator } from '../components/link/LinkCreator';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Shorten Your Links
        </h1>
        <p className="text-xl text-gray-600">
          Create short, memorable links and track their performance
        </p>
      </div>

      {isAuthenticated ? (
        <LinkCreator />
      ) : (
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-600 mb-6">
            Sign up or log in to create and manage your short links
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
          <p className="text-gray-600">
            Lightning-fast redirects with 99.9% uptime
          </p>
        </div>
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
          <p className="text-gray-600">
            Track clicks, locations, devices, and more
          </p>
        </div>
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">QR Codes</h3>
          <p className="text-gray-600">
            Generate QR codes for easy mobile sharing
          </p>
        </div>
      </div>
    </div>
  );
}
