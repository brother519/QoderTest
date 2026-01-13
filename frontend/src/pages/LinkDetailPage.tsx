import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUrl, useUrlAnalytics, useDeleteUrl } from '../hooks/useUrls';
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Download,
  MousePointerClick,
  Users,
  Globe,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: url, isLoading: urlLoading, error: urlError } = useUrl(id!);
  const { data: analytics, isLoading: analyticsLoading } = useUrlAnalytics(id!);
  const deleteUrl = useDeleteUrl();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this link?')) {
      await deleteUrl.mutateAsync(id!);
      navigate('/links');
    }
  };

  const handleDownloadQr = () => {
    if (url?.qrCodeUrl) {
      window.open(`/v1/urls/${id}/qr?size=500`, '_blank');
    }
  };

  if (urlLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (urlError || !url) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load link details.
      </div>
    );
  }

  const stats = [
    { label: 'Total Clicks', value: analytics?.totalClicks ?? 0, icon: MousePointerClick },
    { label: 'Unique Visitors', value: analytics?.uniqueVisitors ?? 0, icon: Users },
    { label: 'Countries', value: analytics?.geography?.length ?? 0, icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/links')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Links
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteUrl.isPending}
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-5 w-5 mr-1" />
          Delete
        </button>
      </div>

      {/* Link Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {url.qrCodeUrl ? (
                <img 
                  src={`/v1/urls/${id}/qr?size=160`} 
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">No QR</span>
              )}
            </div>
            <button
              onClick={handleDownloadQr}
              className="mt-2 w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Download QR
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">/{url.shortCode}</h1>
              <button
                onClick={() => handleCopy(url.shortUrl)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Copy short URL"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-2 flex items-center text-gray-600">
              <span className="truncate">{url.longUrl}</span>
              <a
                href={url.longUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {url.title && (
              <p className="mt-2 text-gray-700">{url.title}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Created {new Date(url.createdAt).toLocaleDateString()}
              </div>
              {url.expiresAt && (
                <div className="flex items-center text-amber-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Expires {new Date(url.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Short URL</p>
              <div className="flex items-center">
                <code className="text-primary-600 font-mono">{url.shortUrl}</code>
                <button
                  onClick={() => handleCopy(url.shortUrl)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center">
                <Icon className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      {analyticsLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          Loading analytics...
        </div>
      ) : analytics && (analytics.totalClicks > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Click Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Click Trend</h2>
            {analytics.timeSeries.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h2>
            {analytics.referrers.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.referrers.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="referrer" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={100}
                      tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                    />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No referrer data
              </div>
            )}
          </div>

          {/* Geography */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h2>
            {analytics.geography.length > 0 ? (
              <div className="space-y-2">
                {analytics.geography.slice(0, 5).map((geo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{geo.country}</span>
                    <span className="text-sm font-medium text-gray-900">{geo.clicks}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-500">
                No geography data
              </div>
            )}
          </div>

          {/* Browsers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Browsers</h2>
            {analytics.browsers.length > 0 ? (
              <div className="space-y-2">
                {analytics.browsers.slice(0, 5).map((browser, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{browser.name}</span>
                    <span className="text-sm font-medium text-gray-900">{browser.clicks}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-500">
                No browser data
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No click data yet. Share your link to see analytics!
        </div>
      )}
    </div>
  );
}
