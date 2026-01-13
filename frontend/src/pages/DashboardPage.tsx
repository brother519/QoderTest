import { Link } from 'react-router-dom';
import { useDashboardAnalytics } from '../hooks/useAnalytics';
import { 
  Link2, 
  MousePointerClick, 
  Users, 
  TrendingUp,
  ExternalLink 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];

export default function DashboardPage() {
  const { data: analytics, isLoading, error } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load analytics. Please check your API key.
      </div>
    );
  }

  const deviceData = analytics ? [
    { name: 'Desktop', value: analytics.devices.desktop },
    { name: 'Mobile', value: analytics.devices.mobile },
    { name: 'Tablet', value: analytics.devices.tablet },
    { name: 'Bot', value: analytics.devices.bot },
  ].filter(d => d.value > 0) : [];

  const stats = [
    { label: 'Total Links', value: analytics?.totalUrls ?? 0, icon: Link2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Clicks', value: analytics?.totalClicks ?? 0, icon: MousePointerClick, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Unique Visitors', value: analytics?.uniqueVisitors ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your URL shortener performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Click Trend</h2>
          {analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
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
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No click data yet
            </div>
          )}
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
          {deviceData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {deviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No device data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Links</h2>
          <Link to="/links" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        
        {analytics?.topLinks && analytics.topLinks.length > 0 ? (
          <div className="space-y-3">
            {analytics.topLinks.slice(0, 5).map((link, index) => (
              <div 
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center min-w-0">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <div className="ml-3 min-w-0">
                    <Link 
                      to={`/links/${link.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      /{link.shortCode}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{link.longUrl}</p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{link.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No links yet. Create your first short URL!
          </div>
        )}
      </div>
    </div>
  );
}
