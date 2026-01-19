import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUrls, useDeleteUrl } from '../hooks/useUrls';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Copy, 
  Trash2, 
  QrCode,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function LinksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { data, isLoading, error } = useUrls(page, 20, search || undefined);
  const deleteUrl = useDeleteUrl();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      deleteUrl.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load links. Please check your API key.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links</h1>
          <p className="text-gray-600">Manage your shortened URLs</p>
        </div>
        <Link
          to="/links/new"
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Link
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search links..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {/* Links Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'No links match your search' : 'No links yet. Create your first short URL!'}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((url) => (
                  <tr key={url.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Link
                          to={`/links/${url.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          /{url.shortCode}
                        </Link>
                        <button
                          onClick={() => handleCopy(url.shortUrl)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy short URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center max-w-xs">
                        <span className="text-sm text-gray-900 truncate">{url.longUrl}</span>
                        <a
                          href={url.longUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{url.totalClicks ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/links/${url.id}`}
                          className="text-gray-400 hover:text-gray-600"
                          title="View QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(url.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                          disabled={deleteUrl.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                    disabled={page === data.pagination.pages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
