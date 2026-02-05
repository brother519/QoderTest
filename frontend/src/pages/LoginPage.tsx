import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Link2, Key } from 'lucide-react';

export default function LoginPage() {
  const [apiKey, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const { setApiKey } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!apiKey.startsWith('sk_')) {
      setError('Invalid API key format');
      return;
    }

    setApiKey(apiKey.trim());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Link2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">URL Shortener</h1>
          <p className="mt-2 text-gray-600">Enter your API key to continue</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setError('');
                  }}
                  placeholder="sk_..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-600 text-center">
              Don't have an API key? Start the backend server in development mode to generate one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
