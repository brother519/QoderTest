import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUrl } from '../hooks/useUrls';
import { Link2, ArrowLeft, Check, Copy } from 'lucide-react';

export default function CreateLinkPage() {
  const navigate = useNavigate();
  const createUrl = useCreateUrl();
  
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState<{ shortUrl: string; shortCode: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!longUrl.trim()) {
      setError('URL is required');
      return;
    }

    try {
      new URL(longUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      const result = await createUrl.mutateAsync({
        longUrl: longUrl.trim(),
        customCode: customCode.trim() || undefined,
        title: title.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });
      
      setCreatedUrl({ shortUrl: result.shortUrl, shortCode: result.shortCode });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create short URL');
    }
  };

  const handleCopy = async () => {
    if (createdUrl) {
      await navigator.clipboard.writeText(createdUrl.shortUrl);
    }
  };

  if (createdUrl) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Link Created!</h2>
          <p className="mt-2 text-gray-600">Your short URL is ready to use</p>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-mono text-primary-600">{createdUrl.shortUrl}</span>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Copy to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => {
                setCreatedUrl(null);
                setLongUrl('');
                setCustomCode('');
                setTitle('');
                setExpiresAt('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Create Another
            </button>
            <button
              onClick={() => navigate('/links')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              View All Links
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Link2 className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">Create Short Link</h1>
            <p className="text-sm text-gray-600">Shorten a long URL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="longUrl" className="block text-sm font-medium text-gray-700">
              Long URL <span className="text-red-500">*</span>
            </label>
            <input
              id="longUrl"
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="customCode" className="block text-sm font-medium text-gray-700">
              Custom Code <span className="text-gray-400">(optional)</span>
            </label>
            <div className="mt-1 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              <input
                id="customCode"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-link"
                pattern="[a-zA-Z0-9_-]+"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Letters, numbers, underscores, and hyphens only. Leave blank for auto-generated code.
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Marketing Campaign Link"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
              Expiration Date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={createUrl.isPending}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createUrl.isPending ? 'Creating...' : 'Create Short Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
