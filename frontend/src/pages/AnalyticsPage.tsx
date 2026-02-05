import { useParams } from 'react-router-dom';
import { useLinkStats, useGeoDistribution } from '../hooks/useAnalytics';
import { useLink } from '../hooks/useLinks';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ClicksChart } from '../components/dashboard/ClicksChart';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const linkId = parseInt(id || '0', 10);

  const { data: link, isLoading: linkLoading } = useLink(linkId);
  const { data: stats, isLoading: statsLoading } = useLinkStats(linkId);
  const { data: geo } = useGeoDistribution(linkId);

  if (linkLoading || statsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!link || !stats) {
    return (
      <div className="text-center py-8 text-red-600">
        Link not found
      </div>
    );
  }

  const deviceChartData = {
    labels: stats.clicks_by_device.map(d => d.device_type),
    datasets: [{
      data: stats.clicks_by_device.map(d => d.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
    }],
  };

  const browserChartData = {
    labels: stats.clicks_by_browser.slice(0, 5).map(b => b.browser),
    datasets: [{
      data: stats.clicks_by_browser.slice(0, 5).map(b => b.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">{link.title || link.short_code}</h1>
        <a
          href={link.short_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700"
        >
          {link.short_url}
        </a>
        <p className="text-gray-500 text-sm mt-1 truncate">{link.original_url}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.total_clicks}</p>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.unique_visitors}</p>
          <p className="text-sm text-gray-500">Unique Visitors</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">
            {stats.clicks_by_country.length}
          </p>
          <p className="text-sm text-gray-500">Countries</p>
        </div>
      </div>

      {/* Clicks Over Time */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Clicks Over Time</h2>
        <ClicksChart data={stats.clicks_by_date} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Devices</h2>
          <div className="h-64 flex justify-center">
            <Doughnut data={deviceChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Browsers */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Browsers</h2>
          <div className="h-64 flex justify-center">
            <Doughnut data={browserChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Countries */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Top Countries</h2>
        <div className="space-y-3">
          {stats.clicks_by_country.slice(0, 10).map((country) => (
            <div key={country.country} className="flex items-center justify-between">
              <span className="text-gray-700">{country.country || 'Unknown'}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${(country.count / stats.total_clicks) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {country.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Referers */}
      {stats.top_referers.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Referers</h2>
          <div className="space-y-2">
            {stats.top_referers.map((ref) => (
              <div key={ref.referer} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-gray-700 truncate max-w-md">{ref.referer}</span>
                <span className="text-gray-500">{ref.count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
